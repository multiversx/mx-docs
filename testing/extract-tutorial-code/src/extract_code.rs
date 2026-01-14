use std::{fs, fs::File, io::Write, path::Path};

mod parser;

use parser::{CodeBlock, extract_code_blocks_from_markdown};

const CROWDFUNDING_TUTORIAL_PATHS: &[&str] = &[
    "../../docs/developers/tutorials/crowdfunding/crowdfunding-p1.md",
    "../../docs/developers/tutorials/crowdfunding/crowdfunding-p2.md",
];

fn extract_code_blocks_from_file<P: AsRef<Path>>(path: P) -> Vec<CodeBlock> {
    let contents = fs::read_to_string(path.as_ref())
        .unwrap_or_else(|e| panic!("not found: {} {:?}", e, path.as_ref()));

    extract_code_blocks_from_markdown(&contents)
}

fn extract_crowdfunding_tutorial_code_blocks() -> Vec<CodeBlock> {
    CROWDFUNDING_TUTORIAL_PATHS
        .iter()
        .map(|tutorial_path| extract_code_blocks_from_file(tutorial_path))
        .flatten()
        .collect()
}

fn write_code_block<P: AsRef<Path>>(code_block_filename: &str, path: P, code_blocks: &[CodeBlock]) {
    let code_block = find_code_block_by_filename(code_blocks, code_block_filename);
    let mut file = File::create(path.as_ref())
        .unwrap_or_else(|e| panic!("could not create file: {} {:?}", e, path.as_ref()));
    file.write_all(code_block.content.as_bytes()).unwrap();
    println!(
        "Successfully extracted {}, language: {}",
        path.as_ref().display(),
        code_block.language.as_deref().unwrap_or("unknown")
    );
}

fn find_code_block_by_filename<'a>(code_blocks: &'a [CodeBlock], filename: &str) -> &'a CodeBlock {
    code_blocks
        .iter()
        .find(|block| block.filename.as_deref() == Some(filename))
        .unwrap_or_else(|| panic!("{} code block not found in tutorials", filename))
}

fn main() {
    fs::create_dir_all("../crowdfunding/scenarios").unwrap();
    fs::create_dir_all("../crowdfunding/src").unwrap();

    let code_blocks = extract_crowdfunding_tutorial_code_blocks();

    // Find and write Cargo.toml
    write_code_block("Cargo.toml", "../crowdfunding/Cargo.toml", &code_blocks);

    // Find and write crowdfunding.rs
    write_code_block(
        "crowdfunding.rs",
        "../crowdfunding/src/crowdfunding.rs",
        &code_blocks,
    );
}
