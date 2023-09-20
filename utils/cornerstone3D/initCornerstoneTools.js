import {
  PanTool,
  WindowLevelTool,
  StackScrollTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  VolumeRotateMouseWheelTool,
  MIPJumpToClickTool,
  LengthTool,
  RectangleROITool,
  EllipticalROITool,
  CircleROITool,
  BidirectionalTool,
  ArrowAnnotateTool,
  DragProbeTool,
  ProbeTool,
  AngleTool,
  CobbAngleTool,
  PlanarFreehandROITool,
  MagnifyTool,
  CrosshairsTool,
  SegmentationDisplayTool,
  init,
  addTool,
  annotation,
  ReferenceLinesTool,
  TrackballRotateTool,
  state,
  BrushTool,
  RectangleScissorsTool,
  CircleScissorsTool,
  SphereScissorsTool,
  PaintFillTool,
} from '@cornerstonejs/tools';
import DICOMSRDisplayTool from 'utils/cornerstone-dicom-sr/src/tools/DICOMSRDisplayTool';

//import CalibrationLineTool from './tools/CalibrationLineTool';

export default function initCornerstoneTools(configuration = {}) {
  CrosshairsTool.isAnnotation = false;
  ReferenceLinesTool.isAnnotation = false;

  init(configuration);

  const addTools = (ToolClass) => {
        const toolName = ToolClass.toolName;
        if (state.tools[toolName] === undefined) {
            addTool(ToolClass)
        }
  }
  const tools = [
    PanTool,
    WindowLevelTool,
    StackScrollTool,
    StackScrollMouseWheelTool,
    ZoomTool,
    LengthTool,
    RectangleROITool,
    EllipticalROITool,
    PlanarFreehandROITool,
    CircleROITool,
    BidirectionalTool,
    ArrowAnnotateTool,
    DragProbeTool,
    ProbeTool,
    AngleTool,
    CobbAngleTool,
    MagnifyTool,
    TrackballRotateTool,
    DICOMSRDisplayTool,
    BrushTool,
    CrosshairsTool,
    SegmentationDisplayTool,
    RectangleScissorsTool,
    CircleScissorsTool,
    SphereScissorsTool,
    PaintFillTool,
  ];
  tools.forEach(tool => addTools(tool))
  // addTool(PanTool);
  // addTool(WindowLevelTool);
  // addTool(StackScrollMouseWheelTool);
  // addTool(StackScrollTool);
  // addTool(ZoomTool);
  // addTool(ProbeTool);
  // addTool(VolumeRotateMouseWheelTool);
  // addTool(MIPJumpToClickTool);
  // addTool(LengthTool);
  // addTool(RectangleROITool);
  // addTool(EllipticalROITool);
  // addTool(CircleROITool);
  // addTool(BidirectionalTool);
  // addTool(ArrowAnnotateTool);
  // addTool(DragProbeTool);
  // addTool(AngleTool);
  // addTool(CobbAngleTool);
  // addTool(PlanarFreehandROITool);
  // addTool(MagnifyTool);
  // addTool(CrosshairsTool);
  // addTool(SegmentationDisplayTool);
  // addTool(ReferenceLinesTool);
  // addTool(CalibrationLineTool);
  // addTool(TrackballRotateTool);

  // Modify annotation tools to use dashed lines on SR
  const annotationStyle = {
    textBoxFontSize: '15px',
    lineWidth: '1.5',
  };

  const defaultStyles = annotation.config.style.getDefaultToolStyles();
  annotation.config.style.setDefaultToolStyles({
    global: {
      ...defaultStyles.global,
      ...annotationStyle,
    },
  });
}

const toolNames = {
  Pan: PanTool.toolName,
  ArrowAnnotate: ArrowAnnotateTool.toolName,
  WindowLevel: WindowLevelTool.toolName,
  StackScroll: StackScrollTool.toolName,
  StackScrollMouseWheel: StackScrollMouseWheelTool.toolName,
  Zoom: ZoomTool.toolName,
  VolumeRotateMouseWheel: VolumeRotateMouseWheelTool.toolName,
  MipJumpToClick: MIPJumpToClickTool.toolName,
  Length: LengthTool.toolName,
  DragProbe: DragProbeTool.toolName,
  Probe: ProbeTool.toolName,
  RectangleROI: RectangleROITool.toolName,
  EllipticalROI: EllipticalROITool.toolName,
  CircleROI: CircleROITool.toolName,
  Bidirectional: BidirectionalTool.toolName,
  Angle: AngleTool.toolName,
  CobbAngle: CobbAngleTool.toolName,
  PlanarFreehandROI: PlanarFreehandROITool.toolName,
  Magnify: MagnifyTool.toolName,
  Crosshairs: CrosshairsTool.toolName,
  SegmentationDisplay: SegmentationDisplayTool.toolName,
  ReferenceLines: ReferenceLinesTool.toolName,
  //CalibrationLine: CalibrationLineTool.toolName,
  TrackballRotateTool: TrackballRotateTool.toolName,
  BrushTool : BrushTool.toolName,
  RectangleScissors: RectangleScissorsTool.toolName,
  CircleScissors: CircleScissorsTool.toolName,
  SphereScissors: SphereScissorsTool.toolName,
  PaintFill: PaintFillTool.toolName,
  CircularBrush : 'CircularBrush',
  CircularEraser : 'CircularEraser',
  SphereBrush : 'SphereBrush',
  SphereEraser : 'SphereEraser',
  ThresholdBrush : 'ThresholdBrush',
};

export { toolNames };
