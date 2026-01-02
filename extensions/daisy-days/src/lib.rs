use zed_extension_api as zed;

struct DaisyDaysExtension;

impl zed::Extension for DaisyDaysExtension {
    fn new() -> Self {
        Self
    }
}

zed::register_extension!(DaisyDaysExtension);
