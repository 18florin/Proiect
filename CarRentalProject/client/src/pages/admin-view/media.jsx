import MediaManager from "@/components/admin-view/media-manager";

function AdminMedia() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Manager</h1>
        <p className="text-muted-foreground mt-1">
          Manage vehicle images, image processing, compression, video, and
          animations.
        </p>
      </div>

      <MediaManager />
    </div>
  );
}

export default AdminMedia;
