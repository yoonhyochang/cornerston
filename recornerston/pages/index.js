import StudiesViewer from "../components/StudiesViewer";
import SeriesViewer from "../components/SeriesViewer";

export default function Home() {
  return (
    <>
      <h1>메인</h1>
      {/* 1. Studie 데이터 연습 */}
      <StudiesViewer></StudiesViewer>

      {/* 2. InstancesViewer Id 값 불러오기*/}
      <SeriesViewer></SeriesViewer>
    </>
  );
}
