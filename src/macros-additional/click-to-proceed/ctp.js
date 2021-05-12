window.CTP = function (config) {
  this.id = "";
  this.selector = "";
  this.stack = [];
  
  this.log = {
    index: 0,
    clear: [0],
    nobr: [],
    transition: []
  };
  
  Object.keys(config).forEach(function (pn) {
    this[pn] = clone(config[pn]);
  }, this);
};

CTP.prototype.add = function (entry) {
  var _this = this;
  var mods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  this.stack.push(entry);
  mods.replace("t8n", "transition").split(" ").forEach(function (el) {
    if (el) _this.log[el].pushUnique(_this.stack.length - 1);
  }, this);
  return this;
};

CTP.prototype.ctpEntry = function (index) {
  if (index < 0 || index >= this.stack.length) return "";
  var t8n = this.log.transition.includes(index) ? "macro-ctp-entry-t8n" : "";
  var br = index === 0 || this.log.clear.includes(index) ? " " : this.log.nobr.includes(index) ? " " : "<br>";
  return br + '<span class="macro-ctp-entry macro-ctp-entry-index-' + index + ' ' + t8n + '">' + this.stack[index] + '</span>';
};

CTP.prototype.advance = function () {
  if (this.log.index === this.stack.length - 1) return this;
  var index = ++this.log.index;
  var _el = $(this.selector);
  if (this.log.clear.includes(index)) _el.empty();
  _el.wiki(this.ctpEntry(index));
  return this;
};

CTP.prototype.out = function () {
  var _this2 = this;
  var clear = this.log.clear;
  var clearIndex = this.log.index > 0 ? clear.findIndex(function (el) {
    return el >= _this2.log.index;
  }, this) - 1 : 0;
  var ret = this.stack.map(function (el, index) {
    return index;
  }).slice(clearIndex, this.log.index + 1).reduce(function (acc, cur) {
    return acc + _this2.ctpEntry(cur);
  }, "");
  return ret;
};

CTP.prototype.clone = function () {
  return new CTP(this);
};

CTP.prototype.toJSON = function () {
  var ownData = {};
  Object.keys(this).forEach(function (pn) {
    ownData[pn] = clone(this[pn]);
  }, this);
  return JSON.reviveWrapper('new CTP($ReviveData$)', ownData);
};

Macro.add("ctp", {
  tags: ["ctpNext"],
  handler: function handler() {
    var _id = this.args[0];
    var _selector = "#" + Util.slugify(_id);
    var ctp = new CTP({
      id: _id,
      selector: _selector
    });
    this.payload.forEach(function (el, index) {
      var _args = el.args;
      if (el.name === "ctp") _args.reverse().pop();
      ctp.add(el.contents.trim(), _args.join(" "));
    });
    variables()["#macro-ctp-dump"] = variables()["#macro-ctp-dump"] || {};
    variables()["#macro-ctp-dump"][_id] = ctp;
    $(this.output).wiki('<span id="' + Util.slugify(_id) + '" class="macro-ctp-wrapper">' + ctp.out() + '</span>');
  }
});

Macro.add("ctpAdvance", {
  handler: function handler() {
    var _id = this.args[0];
    variables()["#macro-ctp-dump"] = variables()["#macro-ctp-dump"] || {};
    var ctp = variables()["#macro-ctp-dump"][_id];
    if (ctp) {
      ctp.advance();
      if (ctp.log.index === ctp.stack.length - 1) {
        delete variables()["#macro-ctp-dump"][_id];
      }
    }
  }
});

$(document).on(':passageinit', function () {
  delete variables()["#macro-ctp-dump"];
});