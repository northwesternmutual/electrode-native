// @flow

import {
  Platform
} from '@walmart/ern-util'
import {
  readJSON,
  writeJSON
} from './fs-util'
import BaseGit from './base-git'
import fs from 'fs'
import path from 'path'

const CAULDRON_FILENAME = 'cauldron.json'

type TypeCauldronMiniApps = {
  container: Array<string>,
  ota: Array<string>
}

type TypeCauldronVersion = {
  name: string,
  ernPlatormVersion: string,
  isReleased: boolean,
  binary: ?string,
  nativeDeps: Array<string>,
  miniApps: TypeCauldronMiniApps,
  config?: Object
}

type TypeCauldronPlatform = {
  name: string,
  versions: Array<TypeCauldronVersion>,
  config?: Object
}

type TypeCauldronNativeApp = {
  name: string,
  platforms: Array<TypeCauldronPlatform>,
  config?: Object
}

type TypeCauldron = {
  nativeApps: Array<TypeCauldronNativeApp>
}

export default class GitStore extends BaseGit {
  _jsonPath: string
  cauldron: Object

  constructor (
    ernPath: string = Platform.rootDirectory,
    repository: string,
    branch: string = 'master',
    cauldron: Object = {
      'nativeApps': []
    }) {
    super(ernPath, repository, branch)
    this._jsonPath = path.resolve(this.path, CAULDRON_FILENAME)
    this.cauldron = cauldron
  }

  async commit (message: string = 'Commit') {
    await writeJSON(this._jsonPath, this.cauldron)
    await this.git.addAsync(CAULDRON_FILENAME)
    await this.git.commitAsync(message)
    await this.push()
  }

  async getCauldron () : Promise<TypeCauldron> {
    await this.sync()
    if (fs.existsSync(this._jsonPath)) {
      this.cauldron = await readJSON(this._jsonPath)
    }
    return this.cauldron
  }
}
