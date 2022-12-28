export class WaitingQueue {
  private resolveList: ((value?: unknown) => void)[] = []
  private rejectList: ((reason?: unknown) => void)[] = []

  wait () {
    return new Promise((resolve, reject) => {
      this.resolveList.push(resolve)
      this.rejectList.push(reject)
    })
  }

  resolve (value?: unknown) {
    this.resolveList.forEach(resolve => resolve(value))
  }

  reject (reason?: unknown) {
    this.rejectList.forEach(reject => reject(reason))
  }
}
