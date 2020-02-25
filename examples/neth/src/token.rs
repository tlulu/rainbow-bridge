
pub trait Token {
    fn total_supply(&self) -> u128;
    fn balance_of(&self, account: String) -> u128;
    fn transfer(&mut self, receiver: String, amount: u128);
}
