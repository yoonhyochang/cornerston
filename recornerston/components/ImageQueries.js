import React from "react";
import { useStudyAndSeriesId } from "../components/ImageQueriesHook";

function ImageQu() {
  const { studyId, seriesId } = useStudyAndSeriesId();

  return (
    <div onContextMenu={(event) => event.preventDefault()}>
      <h1>모듈분리</h1>
      <div>{studyId}</div>
      <div>{seriesId}</div>
    </div>
  );
}

export default ImageQu;
