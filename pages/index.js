import dynamic from "next/dynamic";

// 동적 임포트를 위한 함수를 제공합니다.
const CornerstoneDynamic = dynamic(
  () => import("../components/Cornerstonetest"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <CornerstoneDynamic />
    </>
  );
}
