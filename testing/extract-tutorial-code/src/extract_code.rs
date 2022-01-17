use std::{fs, fs::File, io::Write, path::Path};

use waltz::CodeBlock;

fn extract_code_blocks_from_file<P: AsRef<Path>>(path: P) -> Vec<CodeBlock> {
    let contents = fs::read_to_string(path.as_ref())
        .unwrap_or_else(|e| panic!("not found: {} {:?}", e, path.as_ref()));
    let markdown = pulldown_cmark::Parser::new(contents.as_str());
    waltz::extract_code_blocks(markdown).unwrap()
}

fn extract_crowdfunding_tutorial_code_blocks() -> Vec<CodeBlock> {
    let mut code_blocks_1 =
        extract_code_blocks_from_file("../../docs/developers/tutorials/crowdfunding-p1.md");
    let code_blocks_2 =
        extract_code_blocks_from_file("../../docs/developers/tutorials/crowdfunding-p2.md");
    code_blocks_1.extend(code_blocks_2.into_iter());
    code_blocks_1
}

fn write_code_block<P: AsRef<Path>>(path: P, code_block: &CodeBlock) {
    let mut file = File::create(path).unwrap();
    file.write_all(code_block.content().as_bytes()).unwrap();
}

fn main() {
    fs::create_dir_all("../crowdfunding-esdt/mandos").unwrap();

    let code_blocks = extract_crowdfunding_tutorial_code_blocks();
    for code_block in &code_blocks {
        if let Some(filename) = code_block.filename() {
            match filename.as_str() {
                "Cargo.toml" => write_code_block("../crowdfunding-esdt/Cargo.toml", code_block),
                "final.rs" => write_code_block("../crowdfunding-esdt/src/crowdfunding_main.rs", code_block),
                "crowdfunding-init.scen.json" => write_code_block(
                    "../crowdfunding-esdt/mandos/crowdfunding-init.scen.json",
                    code_block,
                ),
                "crowdfunding-fund.scen.json" => write_code_block(
                    "../crowdfunding-esdt/mandos/crowdfunding-fund.scen.json",
                    code_block,
                ),
                "crowdfunding-fund-too-late.scen.json" => write_code_block(
                    "../crowdfunding-esdt/mandos/crowdfunding-fund-too-late.scen.json",
                    code_block,
                ),
                _ => {}
            }
        }
    }
}
