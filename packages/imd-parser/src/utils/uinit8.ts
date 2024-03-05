export function strToUint8Array(str: string) {
  const arr = []
  for (let i = 0, j = str.length; i < j; ++i)
    arr.push(str.charCodeAt(i))

  const tmpUint8Array = new Uint8Array(arr)
  return tmpUint8Array
}

export function uint8ArrayToStr(fileData: Uint8Array) {
  let dataString = ''
  for (let i = 0; i < fileData.length; i++)
    dataString += String.fromCharCode(fileData[i])

  return dataString
}
