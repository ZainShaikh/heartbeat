(function() {
  window.Heartbeat = (function() {
    function Heartbeat(endpoint, interval) {
      this.endpoint = endpoint;
      this.interval = interval != null ? interval : 600;
      this.started = false;
    }

    Heartbeat.prototype.start = function(params, callback) {
      this.started = true;
      return this.pump(params, callback);
    };

    Heartbeat.prototype.pump = function(params, callback) {
      var self;

      self = this;
      return $.ajax({
        url: this.endpoint,
        data: params,
        cache: false,
        success: function(data) {
          var error;

          try {
            if (callback) {
              callback(data);
            }
          } catch (_error) {
            error = _error;
            alert("" + error);
          }
          if (self.started) {
            return setTimeout(function() {
              return self.pump(params, callback);
            }, self.interval);
          }
        },
        error: function() {}
      });
    };

    Heartbeat.prototype.stop = function() {
      return this.started = false;
    };

    return Heartbeat;

  })();

}).call(this);
