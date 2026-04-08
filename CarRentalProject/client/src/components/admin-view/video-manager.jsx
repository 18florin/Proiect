//client/src/components/admin-view/video-manager.jsx
function VideoManager({
  video,
  setVideo,
  videoFile,
  setVideoFile,
  videoFileName,
  setVideoFileName,
}) {
  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideo(url);
    setVideoFile(file);
    setVideoFileName(file.name);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Vehicle Video</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a presentation or inspection video for the selected vehicle.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Upload video</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {video && (
        <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Video Preview</h4>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              {videoFileName}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border bg-black">
            <video src={video} controls className="max-h-[420px] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoManager;
