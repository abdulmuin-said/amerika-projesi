package com.TechKun.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.TechKun.model.Address;

public interface AddressRepository extends JpaRepository<Address, Integer> {

}
