/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export default class Recording {
  static fromJSON({snapshots, frames}) {
    return new (this)(snapshots, frames);
  }

  constructor(snapshots = [], frames = []) {
    this.snapshots = snapshots;
    this.frames = frames;
  }

  recordSnapshot(snapshot) {
    const snapshotJSON = JSON.stringify(snapshot);
    if (snapshotJSON !== this.lastSnapshotJSON) {
      this.lastSnapshotJSON = snapshotJSON;
      this.snapshots.push(snapshot);
      return this.recordEvent({type: "snapshot"});
    }
  }

  recordEvent(event) {
    const frame = [this.getTimestamp(), this.snapshots.length - 1, event];
    return this.frames.push(frame);
  }

  getSnapshotAtIndex(index) {
    if (index >= 0) { return this.snapshots[index]; }
  }

  getSnapshotAtFrameIndex(frameIndex) {
    const snapshotIndex = this.getSnapshotIndexAtFrameIndex(frameIndex);
    return this.getSnapshotAtIndex(snapshotIndex);
  }

  getTimestampAtFrameIndex(index) {
    return this.frames[index]?.[0];
  }

  getSnapshotIndexAtFrameIndex(index) {
    return this.frames[index]?.[1];
  }

  getEventAtFrameIndex(index) {
    return this.frames[index]?.[2];
  }

  getEventsUpToFrameIndex(index) {
    return Array.from(this.frames.slice(0, index + 1)).map((frame) => frame[2]);
  }

  getFrameCount() {
    return this.frames.length;
  }

  getTimestamp() {
    return new Date().getTime();
  }

  truncateToSnapshotCount(snapshotCount) {
    const offset = this.snapshots.length - snapshotCount;
    if (offset < 0) { return; }

    const {
      frames
    } = this;
    this.frames = (() => {
      const result = [];
      for (let [timestamp, index, event] of Array.from(frames)) {
        if (index >= offset) {
          result.push([timestamp, index - offset, event]);
        }
      }
      return result;
    })();

    return this.snapshots = this.snapshots.slice(offset);
  }

  toJSON() {
    return {snapshots: this.snapshots, frames: this.frames};
  }
}
