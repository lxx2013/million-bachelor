var inited = false

var aLink = document.createElement("a");
var aLinkLastURL = "";

export default function downloadFile(fileName, content) {
  if (!inited) {
    document.body.appendChild(aLink);
    inited = true
  }

  if (aLinkLastURL) URL.revokeObjectURL(aLinkLastURL);
  var blob = new Blob([content]);
  aLink.download = fileName;
  aLink.href = aLinkLastURL = URL.createObjectURL(blob);
  aLink.click();
}
