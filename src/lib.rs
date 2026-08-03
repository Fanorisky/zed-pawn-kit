use zed_extension_api as zed;

struct PawnExtension;

impl zed::Extension for PawnExtension {
    fn new() -> Self {
        Self
    }
}

zed::register_extension!(PawnExtension);
