import ImageQueries from "../components/ImageQueries";

export default function View() {
  return (
    <>
      <h1>메인</h1>

      {/* InstancesViewer 와 Studie Id 값 불러오기 */}
      <ImageQueries></ImageQueries>
    </>
  );
}
