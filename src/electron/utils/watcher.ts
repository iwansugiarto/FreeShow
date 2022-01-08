// not in use

import chokidar from "chokidar"

// https://github.com/paulmillr/chokidar
export default function watch(path: string) {
  const watcher = chokidar.watch(path, {
    depth: 0,
    ignorePermissionErrors: true,
  })

  watcher
    .on("add", (path) => console.log(`File ${path} has been added`))
    .on("change", (path) => console.log(`File ${path} has been changed`))
    .on("unlink", (path) => console.log(`File ${path} has been removed`))
}
