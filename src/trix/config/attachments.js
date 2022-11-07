export const attachmentSelector = "[data-trix-attachment]"

const attachments = {
  preview: {
    presentation: "gallery",
    caption: {
      name: true,
      size: true,
    },
  },
  file: {
    caption: {
      size: true,
    },
  },
}
export default attachments
