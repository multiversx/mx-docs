use elrond_wasm_debug::*;

fn world() -> BlockchainMock {
    let mut blockchain = BlockchainMock::new();

    blockchain.register_contract_builder(
        "file:output/crowdfunding.wasm",
        crowdfunding::ContractBuilder,
    );
    blockchain
}

#[test]
fn crowdfunding_init_rs() {
    elrond_wasm_debug::mandos_rs("mandos/crowdfunding-init.scen.json", world());
}

#[test]
fn crowdfunding_fund_rs() {
    elrond_wasm_debug::mandos_rs("mandos/crowdfunding-fund.scen.json", world());
}

#[test]
fn crowdfunding_fund_too_late_rs() {
    elrond_wasm_debug::mandos_rs("mandos/crowdfunding-fund-too-late.scen.json", world());
}
