import { ToolGroupManager, annotation} from "@cornerstonejs/tools";
import {
	RenderingEngine,
	cache,
	getRenderingEngines
} from '@cornerstonejs/core';

import { getAnnotationManager } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState';
import { segmentation } from "@cornerstonejs/tools";

const volumeRenderingEngineId = "volumeRenderingEngine";
const stackRenderingEngineId = "myRenderingEngine";
const toolGroupId = "CT_TOOLGROUP";
const toolGroupIdFor2D = "2D_TOOLGROUP";
const toolGroupIdFor3D = "3D_TOOLGROUP";

/**
 * cornerstone 초기화
 * cache, ToolGroup
 * 
 */
export default async function init() {
	//cache 삭제
	cache.purgeCache();
	
	//Annotation 클리어
	getAnnotationManager().removeAllAnnotations();
	
	
	//tool group에 연결된 Viewport해제 및 tool group삭제
	getRenderingEngines().forEach((re)=>{
		ToolGroupManager.getAllToolGroups().forEach((tgm) =>{			
			tgm.removeViewports(re.id);
		});
		//re.destroy();
	});
	
	
	// toolGroupManager에 등록된 toolGroup 초기화
	ToolGroupManager.destroyToolGroup(toolGroupId);
	ToolGroupManager.destroyToolGroup(toolGroupIdFor2D);
	ToolGroupManager.destroyToolGroup(toolGroupIdFor3D);
	segmentation.state.removeSegmentation("3D_SEGMENTATION_ID");
	
}
