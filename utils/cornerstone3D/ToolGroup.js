import { toolNames } from "./initCornerstoneTools";
import { Enums as csToolsEnums, ToolGroupManager, BrushTool } from "@cornerstonejs/tools";
import DICOMSRDisplayTool from "utils/cornerstone-dicom-sr/src/tools/DICOMSRDisplayTool";

//corsshair funcs[S]
const _viewport_Axis_Id = "VIEWPOET_AXIS";
const _viewport_Sagittal_Id = "VIEWPOET_SAGITTAL";
const _viewport_Coronal_Id = "VIEWPOET_CORONAL";
const _viewport_VOLUME3D_Id = "VIEWPOET_VOLUME3D";

const _viewportColors = {
	[_viewport_Axis_Id]: 'rgb(200, 0, 0)',
	[_viewport_Sagittal_Id]: 'rgb(200, 200, 0)',
	[_viewport_Coronal_Id]: 'rgb(0, 200, 0)',
};

const _viewportReferenceLineControllable = [
	_viewport_Axis_Id,
	_viewport_Sagittal_Id,
	_viewport_Coronal_Id,
];

const _viewportReferenceLineDraggableRotatable = [
	_viewport_Axis_Id,
	_viewport_Sagittal_Id,
	_viewport_Coronal_Id,
];

const _viewportReferenceLineSlabThicknessControlsOn = [
	_viewport_Axis_Id,
	_viewport_Sagittal_Id,
	_viewport_Coronal_Id,
];

function getReferenceLineColor(viewportId) {
	return _viewportColors[viewportId];
}

function getReferenceLineControllable(viewportId) {
	const index = _viewportReferenceLineControllable.indexOf(viewportId);
	return index !== -1;
}

function getReferenceLineDraggableRotatable(viewportId) {
	const index = _viewportReferenceLineDraggableRotatable.indexOf(viewportId);
	return index !== -1;
}

function getReferenceLineSlabThicknessControlsOn(viewportId) {
	const index = _viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
	return index !== -1;
}
//corsshair funcs[E]

function _getToolNames(toolGroupTools) {

	const toolNames = [];
	if (toolGroupTools.active) {
		toolGroupTools.active.forEach((tool) => {
			toolNames.push(tool.toolName);
		});
	}
	if (toolGroupTools.passive) {
		toolGroupTools.passive.forEach((tool) => {
			toolNames.push(tool.toolName);
		});
	}

	if (toolGroupTools.enabled) {
		toolGroupTools.enabled.forEach((tool) => {
			toolNames.push(tool.toolName);
		});
	}

	if (toolGroupTools.disabled) {
		toolGroupTools.disabled.forEach((tool) => {
			toolNames.push(tool.toolName);
		});
	}

	if (toolGroupTools.instance) {
		toolGroupTools.instance.forEach((tool) => {
			toolNames.push(tool.brushInstanceNames);
		});
	}

	return toolNames;
}

export const addTools = (toolGroup, configs, subType) => {

	const toolGroupId = toolGroup.id;
	const _toolMapper = {
		'CT_TOOLGROUP': tools,
		'2D_TOOLGROUP': toolsFor2D,
		'3D_TOOLGROUP': toolsFor3D,
	};

	const toolObj = _toolMapper[toolGroupId];

	const toolNames = _getToolNames(toolObj);
	toolNames.forEach((toolName) => {
		const toolConfig = configs[toolName] ?? {};
		toolGroup.addTool(toolName, { ...toolConfig });
	});
};

export const addToolInstances = (toolGroup, configs) => {

	const toolNames = _getToolNames(toolsFor2D);
	toolNames.forEach((toolName) => {
		const check = 'instance';

		configs[check].forEach(tool => {
			toolGroup.addToolInstance(
				tool.brushInstanceNames,
				tool.toolName,
				{
					activeStrategy: tool.activeStrategy,
				}
			);
		});
	});
};

export function setToolsMode(toolGroup, tools) {
	const { active, passive, enabled, disabled } = tools;

	if (active) {
		active.forEach(({ toolName, bindings }) => {
			toolGroup.setToolActive(toolName, { bindings });
		});
	}

	if (passive) {
		passive.forEach(({ toolName }) => {
			toolGroup.setToolPassive(toolName);
		});
	}

	if (enabled) {
		enabled.forEach(({ toolName }) => {
			toolGroup.setToolEnabled(toolName);
		});
	}

	if (disabled) {
		disabled.forEach(({ toolName }) => {
			toolGroup.setToolDisabled(toolName);
		});
	}
}

export const tools = {
	active: [
		{
			toolName: toolNames.Pan,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
		},
		{
			toolName: toolNames.Zoom,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
		},
		{ toolName: toolNames.StackScrollMouseWheel, bindings: [] },
	],
	passive: [
		// { toolName: toolNames.Length },
		// { toolName: toolNames.ArrowAnnotate },
		// { toolName: toolNames.Bidirectional },
		// { toolName: toolNames.DragProbe },
		{ toolName: toolNames.EllipticalROI },
		{ toolName: toolNames.CircleROI },
		{ toolName: toolNames.RectangleROI },
		{ toolName: toolNames.WindowLevel },
		// { toolName: toolNames.StackScroll },
		// { toolName: toolNames.Angle },
		{ toolName: toolNames.Magnify },
		{ toolName: toolNames.PlanarFreehandROI },
	],
	enabled: [
		{ toolName: DICOMSRDisplayTool.toolName, bindings: [] },
	]
	// disabled
	//disabled: [{}], //toolName: toolNames.ReferenceLines
};

/**
 * 2D 기준에서 tools를 사용해도 되지만, corsshair 기능은 viewport가 2개 이상 지원되므로 
 * 3D 페이지에서 사용하는 객체 따로 생성
 */
export const toolsFor2D = {
	active: [
		{
			toolName: toolNames.Pan,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
		},
		{
			toolName: toolNames.Zoom,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
		},
		{ toolName: toolNames.StackScrollMouseWheel, bindings: [] },
		{ toolName: toolNames.SegmentationDisplay, bindings: [] },

	],
	passive: [
		{ toolName: toolNames.Length },
		{ toolName: toolNames.EllipticalROI },
		{ toolName: toolNames.CircleROI },
		{ toolName: toolNames.RectangleROI },
		{ toolName: toolNames.Angle },
		{ toolName: toolNames.PlanarFreehandROI },
		{ toolName: toolNames.CobbAngle },
		{ toolName: toolNames.ArrowAnnotate },
		{ toolName: toolNames.BrushTool },
		{ toolName: toolNames.RectangleScissors },
		{ toolName: toolNames.CircleScissors },
		{ toolName: toolNames.PaintFill },
		{ toolName: toolNames.CircularEraser },
		{ toolName: toolNames.ThresholdBrush },
	],
	// enabled
	disabled: [
		{
			toolName: toolNames.Crosshairs,
			configs: {
				// 해당 conf에 사용되는 함수는 line 색/두께에 영향을 미치는 함수
				// 해당 함수들 주석치고 해도 기능은 작동함
				getReferenceLineColor,
				getReferenceLineControllable,
				getReferenceLineDraggableRotatable,
				getReferenceLineSlabThicknessControlsOn
			}
		}
	], //toolName: toolNames.ReferenceLines
	instance: [
		{
			brushInstanceNames: 'CircularBrush'
			, toolName: BrushTool.toolName
			, activeStrategy: 'FILL_INSIDE_CIRCLE'
		},
		{
			brushInstanceNames: 'CircularEraser'
			, toolName: BrushTool.toolName
			, activeStrategy: 'ERASE_INSIDE_CIRCLE'
		},
		{
			brushInstanceNames: 'SphereBrush'
			, toolName: BrushTool.toolName
			, activeStrategy: 'FILL_INSIDE_SPHERE'
		},
		{
			brushInstanceNames: 'SphereEraser'
			, toolName: BrushTool.toolName
			, activeStrategy: 'ERASE_INSIDE_SPHERE'
		},
		{
			brushInstanceNames: 'ThresholdBrush'
			, toolName: BrushTool.toolName
			, activeStrategy: 'THRESHOLD_INSIDE_CIRCLE'
		},

	]
};



export const toolsFor3D = {
	active: [
		// default로 활성화 되는 이벤트
		// ctl 등 복합키로 이벤트 바인딩 하면, ToolBar.js에 window.addEventListener("keydown", __handleKeyDown); 이벤트 겹침
		// 추가확인필요
		{
			toolName: toolNames.Pan,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }], // middle click
		},
		{
			toolName: toolNames.TrackballRotateTool,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],  // left click
		},
		{
			toolName: toolNames.Zoom,
			bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }], // right click
		},
	],
	passive: [
	],
	// enabled
	// disabled
	disabled: [], //toolName: toolNames.ReferenceLines
};
