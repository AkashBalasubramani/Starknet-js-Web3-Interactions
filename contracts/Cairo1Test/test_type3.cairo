      use starknet::get_caller_address;
use starknet::contract_address_const;
use starknet::ContractAddress;
use starknet::StorageAccess;
use starknet::StorageBaseAddress;
use starknet::SyscallResult;
use starknet::storage_read_syscall;
use starknet::storage_write_syscall;
use starknet::storage_address_from_base_and_offset;
use traits::Into;
use traits::TryInto;
use option::OptionTrait;
use starknet::contract_address;
use serde::Serde;
use zeroable::Zeroable;

#[contract]
mod TestContract {
    use starknet::get_caller_address;
use starknet::contract_address_const;
use starknet::ContractAddress;
use starknet::StorageAccess;
use starknet::StorageBaseAddress;
use starknet::SyscallResult;
use starknet::storage_read_syscall;
use starknet::storage_write_syscall;
use starknet::storage_address_from_base_and_offset;
use traits::Into;
use traits::TryInto;
use option::OptionTrait;
use starknet::contract_address;
use serde::Serde;
use zeroable::Zeroable;
// use super::Car;

#[derive(Copy, Drop)]
  struct Car{
        window: u128,
        wheels: u128,
    }

    impl Car_StorageAccess of StorageAccess::<Car> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult::<Car> {
        Result::Ok(
            Car {
                window: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 0_u8)
                )?.try_into().unwrap(),
                wheels: storage_read_syscall(
                    address_domain, storage_address_from_base_and_offset(base, 1_u8)
                )?.try_into().unwrap(),
            }
        )
    }

    fn write(
        address_domain: u32, base: StorageBaseAddress, value: Car
    ) -> SyscallResult::<()> {
        storage_write_syscall(
            address_domain, storage_address_from_base_and_offset(base, 0_u8), value.window.into()
        )?;
        storage_write_syscall(
            address_domain,
            storage_address_from_base_and_offset(base, 1_u8),
            value.wheels.into()
        )
    }
}

    
    struct Storage {
        names: LegacyMap::<ContractAddress,felt252>,
        Vehicle : Car,
    }

    #[constructor]
    fn constructor(address: ContractAddress, name:felt252){
        names::write(address,name);
    }

    #[external]
    fn storeName(_name:felt252){
        let caller = get_caller_address();
        names::write(caller,_name);
        return();
    }

    #[view]
    fn getName(_address:ContractAddress) -> felt252{
        let name = names::read(_address);
        return name;
    }

    #[external]
    fn setStruct(WindowNumber: u128, WheelNumber: u128) {
        let SetValues: Car = Car {
            window : WindowNumber,
            wheels : WheelNumber,
        };
        Vehicle::write(SetValues);
        return ();

    }

}



