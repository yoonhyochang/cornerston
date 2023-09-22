import React from "react";
import { useStudyAndSeriesId } from "./ImageQuerieshook"; // 올바른 경로로 변경해야 할 수 있습니다.

const ImageQu = () => {
    const { studyId } = useStudyAndSeriesId();
    const { seriesId } = useStudyAndSeriesId();

  return (
    <>
      <h1>모듈분리</h1>
      <div>{studyId}</div>
      <div>{seriesId}</div>
    </>
  );
};

export default ImageQu;
