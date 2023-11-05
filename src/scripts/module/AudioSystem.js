const DELAY_UI = 300;

class AudioTime {
  constructor() {
    this.time = "";
    this.timeElement = document.getElementById("jsAudioTime");
  }

  convertTime(time) {
    time = Math.floor(time);
    let res = null;

    if (60 <= time) {
      res = Math.floor(time / 60);
      res +=
        "<span>:</span>" +
        Math.floor(time % 60)
          .toString()
          .padStart(2, "0");
    } else {
      res =
        "0<span>:</span>" +
        Math.floor(time % 60)
          .toString()
          .padStart(2, "0");
    }

    return res;
  }

  update(time) {
    this.time = this.convertTime(time);
    this.timeElement.innerHTML = this.time;
  }

  reset() {
    this.set();
  }

  set() {
    this.timeElement.innerHTML = "0<span>:</span>00";
  }
}

export class AudioSystem {
  constructor(body = document.body) {
    this.body = body;

    this.isInitialized = false;
    this.isGotAudioContext = false;
    this.isPlaying = false;
    this.isClickUI = true;

    // prettier-ignore
    this.audioList = [
      "assets/audio/audio1.mp3", 
      "assets/audio/audio3.mp3",
      "assets/audio/audio2.mp3", 
    ];

    this.status = {
      init: "init",
      run: "run",
      fin: "fin",
      pause: "pause",
    };

    this.params = {
      current: this.audioList.length - 1,
      max: this.audioList.length - 1,
    };

    this.timer = {
      lateShift: null,
    };

    this.updateStatus(this.status.init);
    this.audioElement = document.getElementById("audio");
    this.audioElement.setAttribute("src", this.audioList[0]);
    this.updateAudio(1);

    this.time = new AudioTime();
    this.time.set();
  }

  play() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.updateStatus(this.status.run);

      // AbortError対策の遅延
      setTimeout(() => {
        this.audioElement.volume = 1.0;
        this.audioElement.play();
      }, 300);

      clearTimeout(this.timer.lateShift);
      this.timer.lateShift = setTimeout(() => {
        clearTimeout(this.timer.lateShift);
        this.body.setAttribute("data-audio-late-shift", "on");
      }, 3000);
    }
  }

  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.audioElement.pause();
      this.updateStatus(this.status.pause);

      clearTimeout(this.timer.lateShift);
      this.body.setAttribute("data-audio-late-shift", "");
    }
  }

  loadedAudio(_ele) {
    return new Promise((resolve) => {
      _ele.addEventListener("loadedmetadata", (e) => {
        resolve();
      });
      // ele.addEventListener("canplay", (e) => { resolve(); });
      // ele.addEventListener("canplaythrough", (e) => { resolve(); });
    });
  }

  getAudioContext() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();

    this.audioBufferSource = this.context.createBufferSource();

    this.audioAnalyser = this.context.createAnalyser();
    this.audioAnalyser.smoothingTimeConstant = 1.0;
    this.audioAnalyser.fftSize = 512; // 2048

    this.audioCount = new Uint8Array(this.audioAnalyser.frequencyBinCount);

    this.gainNode = new GainNode(this.context, { gain: 1.0 });
    this.pannerNode = new StereoPannerNode(this.context, { pan: 0 });
    this.filterNode = new BiquadFilterNode(this.context, {
      type: "lowpass",
      frequency: 20000, // 1000
      Q: 10,
    });

    const track = this.context.createMediaElementSource(this.audioElement);
    track
      .connect(this.gainNode)
      .connect(this.pannerNode)
      .connect(this.audioAnalyser)
      .connect(this.filterNode)
      .connect(this.context.destination);

    this.audioBufferSource.loop = false;
    this.audioBufferSource.playbackRate.value = 1.0;

    if (!this.isGotAudioContext) {
      this.isGotAudioContext = true;
      this.play();
    }

    this.setControlers();
    this.setAudioEnded();
  }

  getScale() {
    let scale = 0.0;
    if (this.isPlaying) {
      this.time.update(this.audioElement.currentTime);

      this.audioAnalyser.getByteTimeDomainData(this.audioCount);
      // this.audioAnalyser.getByteFrequencyData(this.audioCount);
      // this.audioAnalyser.getFloatFrequencyData(this.audioCount);

      scale = this.audioCount.reduce((a, b) => Math.max(a, b));
      scale = scale / 255;
    }
    scale -= 0.5;
    scale = scale < 0.0 ? 0.0 : scale;
    return scale;
  }

  async updateAudio(_direction = 1) {
    this.updateDirection(_direction);
    this.setAudioSrc();
    await this.loadedAudio(this.audioElement);

    if (this.isGotAudioContext) {
      this.isPlaying = false;
      this.audioElement.currentTime = 0;
      this.play();
    }

    this.body.setAttribute("data-audio-current-index", this.params.current);
  }

  updateStatus(_data) {
    this.body.setAttribute("data-audio-status", _data);
  }

  updateDirection(_direction = 1) {
    if (_direction === 1) {
      this.params.current++;
      if (this.params.current > this.params.max) this.params.current = 0;
    } else {
      this.params.current--;
      if (this.params.current < 0) this.params.current = this.params.max;
    }
  }

  setAudioSrc() {
    const ele = new Audio(this.audioList[this.params.current]);
    this.audioElement.setAttribute("src", ele.getAttribute("src"));
  }

  setControlers() {
    this.controlEle = {
      time: document.querySelector("#jsTimeProgress"),
      volume: document.querySelector("#jsVolumeProgress"),
      panner: document.querySelector("#jsPannerProgress"),
      playbackRate: document.getElementById("jsPlaybackRateProgress"),
      filter: document.getElementById("jsFilterProgress"),
    };

    if (this.controlEle.time) {
      this.controlEle.time.setAttribute("max", this.audioElement.duration);
      this.controlEle.time.addEventListener("input", (e) => {
        this.audioElement.currentTime = e.target.value;
      });
      this.audioElement.addEventListener("timeupdate", (e) => {
        this.controlEle.time.value = e.target.currentTime;
      });
    }

    if (this.controlEle.volume) {
      this.gainNode.gain.value = this.controlEle.volume.value;
      this.controlEle.volume.addEventListener("input", (e) => {
        this.gainNode.gain.value = e.target.value;
      });
    }

    if (this.controlEle.panner) {
      this.pannerNode.pan.value = this.controlEle.panner.value;
      this.controlEle.panner.addEventListener("input", (e) => {
        this.pannerNode.pan.value = e.target.value;
      });
    }

    if (this.controlEle.playbackRate) {
      this.audioElement.playbackRate = 1.0;
      this.controlEle.playbackRate.addEventListener("input", (e) => {
        this.audioElement.playbackRate = e.target.value;
      });
    }

    if (this.controlEle.filter) {
      this.filterNode.frequency.value = 20000;
      this.controlEle.filter.addEventListener("input", (e) => {
        this.filterNode.frequency.value = e.target.value;
      });
    }
  }

  setPlayBtn() {
    const onPlay = () => {
      if (this.isClickUI && this.isInitialized) {
        this.isClickUI = false;
        if (this.isGotAudioContext) {
          this.play();
          this.gainNode.gain.value = 1.0;
        } else {
          this.getAudioContext();
        }
        setTimeout(() => {
          this.gainNode.gain.value = 1.0;
          this.isClickUI = true;
        }, DELAY_UI);
      }
    };

    this.playBtnList = [...document.querySelectorAll(".jsPlayBtn")];
    if (this.playBtnList) {
      for (let i = 0; i < this.playBtnList.length; i++) this.playBtnList[i].addEventListener("click", onPlay);
    }
  }

  setPauseBtn() {
    const onPause = () => {
      if (this.isClickUI && this.isInitialized) {
        this.isClickUI = false;
        this.pause();
        setTimeout(() => {
          this.isClickUI = true;
        }, DELAY_UI);
      }
    };

    this.pauseBtnList = [...document.querySelectorAll(".jsPauseBtn")];
    if (this.pauseBtnList) {
      for (let i = 0; i < this.pauseBtnList.length; i++) this.pauseBtnList[i].addEventListener("click", onPause);
    }
  }

  setMenuBtn() {
    this.isChangedFilter = false;
    this.menuOpenBtn = document.getElementById("jsAudioConfigOpenBtn");
    this.menuOpenBtn.addEventListener("click", (e) => {
      this.body.setAttribute("data-audio-menu", "1");
      if (this.filterNode) {
        if (this.filterNode.frequency.value === 20000) {
          this.filterNode.frequency.value = 1000;
          this.controlEle.filter.value = 1000;
          this.isChangedFilter = true;
        }
      }
    });

    this.menuCloseBtn = document.getElementById("jsAudioConfigCloseBtn");
    this.menuCloseBtn.addEventListener("click", (e) => {
      this.body.setAttribute("data-audio-menu", "0");
      if (this.filterNode) {
        if (this.isChangedFilter && this.filterNode.frequency.value === 1000) {
          this.filterNode.frequency.value = 20000;
          this.controlEle.filter.value = 20000;
          this.isChangedFilter = false;
        }
      }
    });
  }

  setAudioSynchro() {
    this.audioElement.addEventListener("play", (e) => {
      if (this.playBtnList != null) this.playBtnList[0].click();
    });
    this.audioElement.addEventListener("pause", (e) => {
      if (this.pauseBtnList[0] != null) this.pauseBtnList[0].click();
    });
  }

  setAudioEnded() {
    this.audioElement.addEventListener("ended", (e) => {
      this.updateStatus(this.status.fin);
      this.pause();
      this.updateAudio(1);
    });
  }

  setInputFile() {
    this.inputAudioFile = document.getElementById("jsAudioFile");
    this.inputAudioFile.addEventListener("input", (e) => {
      !!(async () => {
        this.audioElement.currentTime = 0;

        this.pauseBtnList[0].click();

        const file = e.target.files[0];
        const nextElement = e.target.nextElementSibling;
        nextElement.innerHTML = file.name;

        const audioSrc = URL.createObjectURL(file);
        let nextIndex = this.params.current++;
        if (nextIndex > this.params.max) nextIndex = 0;

        this.audioList[nextIndex] = audioSrc;
        this.updateAudio(1);
      })();
    });
  }

  init() {
    console.log("🚀 ~ AudioSystem init");
    this.setPlayBtn();
    this.setPauseBtn();
    this.setMenuBtn();
    this.setAudioSynchro();
    this.setInputFile();

    this.isInitialized = true;
  }
}
