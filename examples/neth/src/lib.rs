use borsh::{BorshDeserialize, BorshSerialize};
use near_bindgen::{env, near_bindgen, collections::{Map}};
use eth_types::Address;

mod token;

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[near_bindgen]
#[derive(Default, BorshDeserialize, BorshSerialize)]
pub struct NETH {
    pub total_supply: u128,
    pub balances: Map<String, u128>,
}

#[near_bindgen]
impl NETH {
    fn mint(&mut self, account: &String, amount: u128) {
        self.total_supply = self.total_supply + amount;
        self.balances.insert(&account, &(self.balances.get(&account).unwrap_or(0) + amount));
        env::log(format!("{}::{}::{:x}", "Mint", account, amount).as_bytes());
        env::log(format!("{}::{}::{}::{:x}", "Transfer", "", account, amount).as_bytes());
    }

    fn burn(&mut self, account: &String, amount: u128) {
        self.total_supply = self.total_supply - amount;
        self.balances.insert(&account, &(self.balances.get(&account).unwrap_or(0) - amount));
        env::log(format!("{}::{}::{:x}", "Burn", account, amount).as_bytes());
        env::log(format!("{}::{}::{}::{:x}", "Transfer", account, "", amount).as_bytes());
    }

    pub fn issue(&mut self, log: Vec<u8>, proof: Vec<u8>) {
        // TODO: verify log with proof

        // TODO: deserialize log
        let account = "".to_string();
        let amount: u128 = 0;
        
        self.mint(&account, amount);
        env::log(format!("{}::{:x?}::{:x}", "Issue", &account, amount).as_bytes());
    }

    pub fn redeem(&mut self, account: Address, amount: u128) {
        self.burn(&env::signer_account_id(), amount);
        env::log(format!("{}::{:x?}::{:x}", "Redeem", account, amount).as_bytes());
    }
}

impl token::Token for NETH {
    fn total_supply(&self) -> u128 {
        self.total_supply
    }

    fn balance_of(&self, account: String) -> u128 {
        self.balances.get(&account).unwrap_or(0)
    }

    fn transfer(&mut self, receiver: String, amount: u128) {
        let sender = env::signer_account_id();
        self.balances.insert(&sender, &(self.balances.get(&sender).unwrap_or(0) - amount));
        self.balances.insert(&receiver, &(self.balances.get(&receiver).unwrap_or(0) + amount));
        env::log(format!("{}::{}::{}::{:x}", "Transfer", sender, receiver, amount).as_bytes());
    }
}
