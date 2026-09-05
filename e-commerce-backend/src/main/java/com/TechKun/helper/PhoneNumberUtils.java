package com.TechKun.helper;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import com.google.i18n.phonenumbers.NumberParseException;

public class PhoneNumberUtils {

    private static final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    public static String formatPhoneNumber(String rawPhoneNumber) throws NumberParseException {
        Phonenumber.PhoneNumber numberProto = phoneUtil.parse(rawPhoneNumber, null);
        return phoneUtil.format(numberProto, PhoneNumberUtil.PhoneNumberFormat.INTERNATIONAL);
    }
    public static boolean isValidPhoneNumber(String phoneNumber) throws NumberParseException {
        Phonenumber.PhoneNumber numberProto = phoneUtil.parse(phoneNumber, null);
        return phoneUtil.isValidNumber(numberProto);
    }
}
