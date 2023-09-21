import CornerstoneViewer from "../components/CornerstoneViewer"
import StudiesViewer from "../components/StudiesViewer";

export default function Home() {
  return (
    <>
      <h1>메인</h1>
      {/* 1. Cornerstone 데이터 연습 */}
      <CornerstoneViewer></CornerstoneViewer>

      {/* 2. Studie Id 값 불러오기*/}
      <StudiesViewer></StudiesViewer>
    </>
  );
}
