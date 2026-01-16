use pulldown_cmark::{Event, Parser, Tag, TagEnd};

#[derive(Debug, Clone)]
pub struct CodeBlock {
    pub filename: Option<String>,
    pub language: Option<String>,
    pub content: String,
}

pub fn extract_code_blocks_from_markdown(markdown_content: &str) -> Vec<CodeBlock> {
    let parser = Parser::new(markdown_content);
    let mut code_blocks = Vec::new();
    let mut in_code_block = false;
    let mut current_code = String::new();
    let mut current_language = None;
    let mut current_filename = None;

    for event in parser {
        match event {
            Event::Start(Tag::CodeBlock(kind)) => {
                in_code_block = true;
                current_code.clear();

                // Extract language and filename from code block info
                let info = match kind {
                    pulldown_cmark::CodeBlockKind::Fenced(info) => info.to_string(),
                    pulldown_cmark::CodeBlockKind::Indented => String::new(),
                };

                // Parse info string which can contain language and filename
                // Format: ```rust title="filename.rs" or ```rust filename="filename.rs" or ```filename.rs
                if !info.is_empty() {
                    parse_code_block_info(&info, &mut current_language, &mut current_filename);
                }
            }
            Event::End(TagEnd::CodeBlock) => {
                if in_code_block {
                    code_blocks.push(CodeBlock {
                        filename: current_filename.take(),
                        language: current_language.take(),
                        content: current_code.clone(),
                    });
                    in_code_block = false;
                }
            }
            Event::Text(text) => {
                if in_code_block {
                    current_code.push_str(&text);
                }
            }
            _ => {}
        }
    }

    code_blocks
}

fn parse_code_block_info(info: &str, language: &mut Option<String>, filename: &mut Option<String>) {
    let parts: Vec<&str> = info.split_whitespace().collect();

    if parts.is_empty() {
        return;
    }

    // First part is typically the language
    let first_part = parts[0];

    // Check if the first part looks like a filename (contains a dot)
    if first_part.contains('.')
        && !first_part.starts_with("title=")
        && !first_part.starts_with("filename=")
    {
        *filename = Some(first_part.to_string());
        // If it looks like a filename, try to extract language from extension
        if let Some(ext) = first_part.split('.').next_back() {
            *language = Some(ext.to_string());
        }
    } else {
        *language = Some(first_part.to_string());
    }

    // Look for title= or filename= attributes
    for part in &parts[1..] {
        if let Some(stripped) = part.strip_prefix("title=") {
            *filename = Some(strip_quotes(stripped));
        } else if let Some(stripped) = part.strip_prefix("filename=") {
            *filename = Some(strip_quotes(stripped));
        }
    }
}

fn strip_quotes(s: &str) -> String {
    s.trim_matches('"').trim_matches('\'').to_string()
}
