/**
 * import
 */
import {
	utilities,
	metaData,
	getEnabledElementByIds,
} from '@cornerstonejs/core';
import { getAnnotationManager } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState';
import { adaptersSR } from '@cornerstonejs/adapters';
import dcmjs from 'dcmjs';
import { api } from 'dicomweb-client';
import { multipartEncode, multipartDecode } from './cornerstone3D/message';
import axios from 'axios';

/**
 * 전역변수 
 */
const renderingEngineId = "volumeRenderingEngine";
const viewport_Axis_Id = "VIEWPOET_AXIS";
const { MeasurementReport } = adaptersSR.Cornerstone3D;

const { DicomMetaDictionary, DicomDict } = dcmjs.data;
const { naturalizeDataset, denaturalizeDataset } = DicomMetaDictionary;
let wadoRsRoot = null;


/**
 * dicom SR 
 */
export async function getReport(seriesDescription, instanceInfo) {
	const { annotations } = getAnnotationManager();
	const { viewport } = getEnabledElementByIds(viewport_Axis_Id, renderingEngineId);
	const FrameOfReferenceUID = viewport.getFrameOfReferenceUID();
	const arrRoi = annotations[FrameOfReferenceUID];

	const toolTypes = Object.keys(arrRoi);
	const toolState = {};
	toolTypes.forEach((key) => {
		arrRoi[key].forEach((item) => {
			const imageId = item.metadata.referencedImageId;
			if (!toolState[imageId]) {
				toolState[imageId] = {};
			}
			if (!toolState[imageId][key]) {
				toolState[imageId][key] = { data: [] };
			}
			toolState[imageId][key].data.push(item);
		});
	});

	// 임시(수정필요)
	const option = {
		SeriesDescription: "TEST_3D_SR"
		, SeriesNumber: instanceInfo.seriesNumber,
	};

	const report = MeasurementReport.generateReport(
		toolState,
		metaData,
		utilities.worldToImageCoords,
		option
	);

	const { dataset } = report;

	// Set the default character set as UTF-8
	// https://dicom.innolitics.com/ciods/nm-image/sop-common/00080005
	if (typeof dataset.SpecificCharacterSet === 'undefined') {
		dataset.SpecificCharacterSet = 'ISO_IR 192';
	}

	return dataset;
}



export async function saveReport(dataset, wadoRsRoot) {
	wadoRsRoot = wadoRsRoot;

	const studyInstanceUID = dataset.StudyInstanceUID;

	// OHIF -> extensions\default\src\DicomWebDataSource\index.js -> store.dicom 참고
	// make file
	if (dataset instanceof ArrayBuffer) {
		const options = {
			datasets: [dataset],
			request,
		};
		//await wadoDicomWebClient.storeInstances(options);
	} else {
		const meta = {
			FileMetaInformationVersion:
				dataset._meta.FileMetaInformationVersion.Value,
			MediaStorageSOPClassUID: dataset.SOPClassUID,
			MediaStorageSOPInstanceUID: dataset.SOPInstanceUID,
			// TransferSyntaxUID: EXPLICIT_VR_LITTLE_ENDIAN,
			TransferSyntaxUID: '1.2.840.10008.1.2.1',
			ImplementationClassUID: '2.25.270695996825855179949881587723571202391.2.0.0',
			ImplementationVersionName: 'OHIF-VIEWER-2.0.0',
		};

		const denaturalized = denaturalizeDataset(meta);
		const dicomDict = new DicomDict(denaturalized);

		dicomDict.dict = denaturalizeDataset(dataset);

		const part10Buffer = dicomDict.write();

		const blob = new Blob([part10Buffer], { type: 'application/dicom' });

		// // 강제로 파일 떨구기[S] - 테스트용
		// // Create a URL for the blob
		// const blobUrl = URL.createObjectURL(blob);

		// // Create a link element
		// const link = document.createElement('a');
		// link.href = blobUrl;
		// link.download = 'testDicom';

		// // Simulate a click to initiate the download
		// link.click();

		// // Release the object URL after the download is initiated
		// URL.revokeObjectURL(blobUrl);
		// // 강제로 파일 떨구기[E] - 테스트용

		const options = {
			datasets: [part10Buffer],
			undefined, //request, - OHIF에서 사용하지 않음
		};

		const madeInClient = false;

		// await wadoDicomWebClient.storeInstances(options);
		await storeInstances(options, studyInstanceUID, madeInClient);
	}

	async function storeInstances(instances, studyInstanceUID) {
		const wadoDicomWebClient = new api.DICOMwebClient({ url: wadoRsRoot });

		// guid / multipartEncode는 mode_modules\dicomweb-client\src\message.js에서 메서드 가져옴
		// TODO: storeInstances에 필요한 메서드 commonUtil로 정리 필요
		let url = `${wadoDicomWebClient.stowURL}/studies/${studyInstanceUID}`;

		const { data, boundary } = multipartEncode(instances.datasets);

		axios.post(
			url
			, data
			, {
				headers: {
					'Content-Type': `multipart/related; type="application/dicom"; boundary="${boundary}"`
				}
			})
			.then(result => {
				let resultObj = result;
				console.log(resultObj);
			})
			.catch(err => {
				console.log(err);
			})
	}
}

export async function deleteReport() {
	// SR데이터 삭제시 /series 인지 /instance 인지 확인필요
	// let url = `${wadoDicomWebClient.stowURL}/series/2.25.388542151736941366816728589766154501890`;

	// TODO: 07ab3a5e-0166d7f2-674859a6-2b523910-4363eb85 형태값(UUID) 찾아서 넣어야함
	// leftPannel SeriesList 가져오는 부분 찾아봐야함
	// delete method header셋팅 필요할듯
	let url = 'http://172.30.1.71/orthanc/series/b1684f2a-a9a538e6-f4c27455-974c55bd-945f7aa1';
	// 테스트용 삭제
	axios.delete(url)
		.then(result => {
			let resultObj = result;
			console.log(resultObj);
		})
		.catch(err => {
			console.log(err);
		})
}