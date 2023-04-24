#[contract]
mod HelloStarknet {
    struct Storage {
        balance1: felt252, 
        balance2: felt252,
    }
    

    // Increases the balance by the given amount.
    #[external]
    fn increase_balance(amount1: felt252,amount2:felt252) {
        balance1::write(balance1::read() + amount1);
        balance2::write(balance2::read() + amount2);
    }

    // Returns the current balance.
    #[view]
    fn get_balance() -> (felt252,felt252) {
        let res1 = balance1::read();
        let res2 = balance2::read();
        return (res1,res2);

    }
}
