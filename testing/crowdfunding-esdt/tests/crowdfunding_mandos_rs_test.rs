use elrond_wasm::*;
use elrond_wasm_debug::*;

fn world() -> BlockchainMock {
    let mut blockchain = BlockchainMock::new();

    blockchain.register_contract(
        "file:output/crowdfunding.wasm",
        Box::new(|context| Box::new(crowdfunding::contract_obj(context))),
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
