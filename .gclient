solutions = [
  { "name"        : "src",
    "url"         : "https://chromium.googlesource.com/chromium/src.git",
    "custom_deps" : {
      # To use the trunk of a component instead of what's in DEPS:
      #"component": "https://github.com/luci/luci-go",
      # To exclude a component from your working copy:
      #"data/really_large_component": None,
    }
  },
]
