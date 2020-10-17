use wasm_bindgen::prelude::*;

pub mod encrypt;

#[wasm_bindgen]
pub fn square(x: i32) -> i32 {
    x * x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(square(2), 4);
    }
}
