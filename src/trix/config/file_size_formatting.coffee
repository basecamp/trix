Trix.config.fileSize =
  prefix: "IEC"
  precision: 2
  lang:
    byte: "Byte"
    bytes: "#{@byte}s"
    sizes: [@bytes, "KB", "MB", "GB", "TB", "PB"]

  formatter: (number) ->
    switch number
      when 0 then "0 #{@lang.bytes}"
      when 1 then "1 #{@lang.byte}"
      else
        base = switch @prefix
          when "SI"  then 1000
          when "IEC" then 1024
        exp = Math.floor(Math.log(number) / Math.log(base))
        humanSize = number / Math.pow(base, exp)
        string = humanSize.toFixed(@precision)
        withoutInsignificantZeros = string.replace(/0*$/, "").replace(/\.$/, "")
        "#{withoutInsignificantZeros} #{@lang.sizes[exp]}"
