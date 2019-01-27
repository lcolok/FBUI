new Vue({
  el: '#app',
  data: () => ({
    dark: false,

    drawers: ['Default (no property)', 'Permanent', 'Temporary'],
    primaryDrawer: {
      model: null,
      type: 'default (no property)',
      clipped: true,
      floating: false,
      mini: false
    },
    footer: {
      inset: false
    },
    searchLoading: false,
    keyword: '',
    custom: true,
    loader: null,
    loading: false,
    loading2: false,
    loading3: false,
    loading4: false,
    alert: true,
    rules: {
      required: value => !!value || '必填信息',
      counter: value => (value == null ? 0 : value.length) <= 20 || '最多只能填写20个字符',
      email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Invalid e-mail.'
      },
      entropy: value => {
        var shannonEntropy = entropy(value).toString();
        console.log(shannonEntropy);
        return `信息熵:${shannonEntropy}`
      }
    }
  }),
  computed: {
    progress() {
      var num = this.keyword == null ? 0 : this.keyword.length;
      return Math.min(100, num * 10)
    },
    color() {
      return ['error', 'warning', 'success'][Math.floor(this.progress / 40)]
    }
  },
  watch: {
    loader() {
      var _this = this;
      var l = this.loader;
      this[l] = !this[l];

      setTimeout(function () { return _this[l] = false; }, 3000);

      this.loader = null;
    }
  },
  methods: {


    searchByKeyword(delay) {
      var target = this;
      if (target.keywordLasttime != target.keyword) {
        if (target.lastTime == 0) {
          searchLC(target, delay);
        } else {
          clearTimeout(target.lastTime);
          searchLC(target, delay);
        }
      }
    }

  },

})



function searchLC(target, delay) {

  target.lastTime = setTimeout(() => {
    var key = target.keyword;
    showLoading(target);
    target.keywordLasttime = key;
    window.location.href = `#/${key}`
    console.log('关键词为:' + key);
  }, delay)
}


function showLoading(target) {
  target.custom = false;
  target.searchLoading = true;
  setTimeout(() => {
    target.custom = true;
    target.searchLoading = false;
  }, 2000)
}

function process(s, evaluator) {
  var h = Object.create(null), k;
  s.split('').forEach(function (c) {
    h[c] && h[c]++ || (h[c] = 1);
  });
  if (evaluator) for (k in h) evaluator(k, h[k]);
  return h;
};

function entropy(s) {
  var sum = 0, len = s.length;
  process(s, function (k, f) {
    var p = f / len;
    sum -= p * Math.log(p) / Math.log(2);
  });
  return sum;
};