import fs from 'fs/promises'
import fastJSONStringify from 'fast-json-stringify'

const action = process.argv[2]

if (!action) {
  console.log(dedent`
  Please pass one of these actions: 'enhance' or 'reverse-enhance'
  'enhance' to transform .js or .ts files' JSON.stringify to fastJSONStringify
  'reverse-enhance' to reverse the 'enhance' action
  `)
  process.exit(1)
}

async function getWorkingDirectoryDirectories() {
  return (await fs.readdir('./', { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

async function getWorkingDirectoryFiles() {
  return (await fs.readdir('./', { withFileTypes: true }))
    .filter(dirent => !dirent.isDirectory())
    .map(dirent => dirent.name)
}

const workingDirectoryDirectories = await getWorkingDirectoryDirectories()
const selectedDirectories = ['.', ...workingDirectoryDirectories]
const workingDirectoryFiles = await getWorkingDirectoryFiles()
const selectedFiles = workingDirectoryFiles.filter(file => file.endsWith('.js') || file.endsWith('.ts'))

if (action === 'enhance') {
  for (const directory of selectedDirectories) {
    if (directory === 'node_modules') continue
    console.log(directory)
    for (const file of selectedFiles) {
      const strs = (await fs.readFile(file, 'utf-8')).split('\n')
      let isImportSyntax = false
      let hasDetectedBefore = false
      let lastInx = null
      for (let inx = 0; inx < strs.length; inx++) {
        const str = strs[inx];
        const match = str.match(/import .*?\b from |.*?\b = require/)
        if (match) (lastInx = inx), (isImportSyntax = match[0].includes('import')), (hasDetectedBefore = true)
        else if (hasDetectedBefore) break
      }
      strs.splice(1, 0, isImportSyntax ? 'import fastJSONStringify from \'fast-json-stringify\'' : 'const fastJSONStringify = require(\'fast-json-stringify\')')
      fs.writeFile(`${directory}/${file}`, strs.join('\n'))
    }
  }
}

if (action === 'reverse-enhance') {

}