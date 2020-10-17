use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hash(password: &str, salt: &str) -> String {
    let config = argon2::Config::default();
    argon2::hash_encoded(password.as_bytes(), salt.as_bytes(), &config).unwrap()
}

#[wasm_bindgen]
pub fn verify(password: &str, hash: &str) -> bool {
    argon2::verify_encoded(hash, password.as_bytes()).unwrap()
}
