import Filter from "./filter"

export const attachmentGalleryFilter = function(snapshot) {
  const filter = new Filter(snapshot)
  filter.perform()
  return filter.getSnapshot()
}

