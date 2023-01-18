use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.register_contract(
        "file:output/crowdfunding.wasm",
        crowdfunding::ContractBuilder,
    );
    blockchain
}

#[test]
fn crowdfunding_init_rs() {
    multiversx_sc_scenario::run_rs("scenarios/crowdfunding-init.scen.json", world());
}

#[test]
fn crowdfunding_fund_rs() {
    multiversx_sc_scenario::run_rs("scenarios/crowdfunding-fund.scen.json", world());
}

#[test]
fn crowdfunding_fund_too_late_rs() {
    multiversx_sc_scenario::run_rs("scenarios/crowdfunding-fund-too-late.scen.json", world());
}
