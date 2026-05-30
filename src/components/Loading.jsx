// Re-export shim: komponen Loading lama sekarang menggunakan
// versi reusable dari src/Reusable/Loading. Default fullscreen
// dipertahankan supaya pemakaian sebelumnya (mis. Suspense fallback
// di App.jsx) tidak berubah perilakunya.
import LoadingReusable from '../Reusable/Loading';

const Loading = (props) => <LoadingReusable fullscreen {...props} />;

export default Loading;
