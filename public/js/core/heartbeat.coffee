class window.Heartbeat
	constructor: (@endpoint, @interval = 600) ->
		@started = false
	
	start: (params, callback) ->
		@started = true
		@pump params, callback

	pump: (params, callback) -> 
		
		self = @
		#params.push { token: @token }

		$.ajax 
			url: @endpoint,
			data: params,
			cache: false,
			success: (data) ->

				try
					callback data if callback
				catch error
					alert "#{error}"

				setTimeout -> 
				
					self.pump params, callback

				, self.interval if self.started

			error: () ->
				

	stop: ->
		@started = false
