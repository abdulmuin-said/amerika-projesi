package com.TechKun.service;

import java.util.ArrayList;
import java.util.List;

import com.TechKun.dto.AddressDTO;
import com.TechKun.model.Address;
import com.TechKun.model.ShopUser;
import com.TechKun.repository.ShopUserRepository;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.TechKun.dto.user_dtos.*;
import org.springframework.util.StringUtils;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private ShopUserRepository shopUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return shopUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public List<ShopUser> getAllUsers(UserQueryOptions filters) {
        return this.shopUserRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters != null) {
                if (StringUtils.hasText(filters.getFullName()))
                    predicates.add(cb.equal(root.get("fullName"), filters.getFullName()));
                if (StringUtils.hasText(filters.getPhoneNo()))
                    predicates.add(cb.equal(root.get("phoneNo"), filters.getPhoneNo()));
                if (StringUtils.hasText(filters.getEmail()))
                    predicates.add(cb.equal(root.get("email"), filters.getEmail()));
                boolean cityFilterPresent = StringUtils.hasText(filters.getCity());
                boolean countryFilterPresent = StringUtils.hasText(filters.getCountry());
                if (cityFilterPresent || countryFilterPresent) {
                    Path<Address> address = root.get("address");
                    if (cityFilterPresent)
                        predicates.add(cb.equal(address.get("city"), filters.getCity()));
                    if (countryFilterPresent)
                        predicates.add(cb.equal(address.get("country"), filters.getCountry()));
                }
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        });
    }

    public ShopUser updateUser(ShopUser loggedInUser, UserUpdatePayload payload) {
        boolean updateName = StringUtils.hasText(payload.getFullName());
        AddressDTO addressDTO = payload.getAddress();
        boolean updateAddress = addressDTO != null;
        boolean updateAddressLine = updateAddress && StringUtils.hasText(addressDTO.getStreet());
        boolean updateCity = updateAddress && StringUtils.hasText(addressDTO.getCity());
        boolean updateCountry = updateAddress && StringUtils.hasText(addressDTO.getCountry());
        boolean updatePincode = updateAddress && addressDTO.getPincode() != null;
        if (!(updateName
                || updateAddressLine
                || updateCity
                || updateCountry
                || updatePincode))
            throw new IllegalStateException("At least one field must be provided for update.");

        if (updateName)
            loggedInUser.setFullName(payload.getFullName());
        if (updateAddress) {
            Address address = loggedInUser.getAddress();
            if (updateAddressLine)
                address.setStreet(addressDTO.getStreet());
            if (updateCity)
                address.setCity(addressDTO.getCity());
            if (updateCountry)
                address.setCountry(addressDTO.getCountry());
            if (updatePincode)
                address.setPincode(addressDTO.getPincode());
        }

        return this.shopUserRepository.save(loggedInUser);
    }

    public void removeUser(Integer userId) {
        ShopUser shopUser = this.shopUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        shopUser.setRemoved(true);
        this.shopUserRepository.save(shopUser);
    }
}
