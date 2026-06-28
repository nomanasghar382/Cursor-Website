import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AddressDto } from "../dto/customer.dto";
import { CustomerRepository } from "../repositories/customer.repository";

@Injectable()
export class CustomerAddressesService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async list(userId: string) {
    const addresses = await this.customerRepository.listAddresses(userId);
    return {
      addresses: addresses.map((address) => ({
        id: address.id,
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        postalCode: address.postalCode,
        city: address.city?.name,
        country: address.country.name,
        countryCode: address.country.iso2,
        isDefault: address.isDefault,
      })),
    };
  }

  async create(userId: string, dto: AddressDto) {
    const country = await this.customerRepository.findCountryByCode(dto.countryCode ?? "US");
    if (!country) throw new BadRequestException("Country is not supported.");

    const address = await this.customerRepository.createAddress(userId, {
      countryId: country.id,
      label: dto.label,
      recipientName: dto.recipientName,
      phone: dto.phone,
      line1: dto.line1,
      line2: dto.line2,
      postalCode: dto.postalCode,
      isDefault: dto.isDefault ?? false,
    });

    return { address: { id: address.id } };
  }

  async update(userId: string, addressId: string, dto: AddressDto) {
    const existing = await this.customerRepository.listAddresses(userId);
    if (!existing.find((entry) => entry.id === addressId)) {
      throw new NotFoundException("Address not found.");
    }

    await this.customerRepository.updateAddress(userId, addressId, {
      label: dto.label,
      recipientName: dto.recipientName,
      phone: dto.phone,
      line1: dto.line1,
      line2: dto.line2,
      postalCode: dto.postalCode,
      isDefault: dto.isDefault,
    });

    return this.list(userId);
  }

  async remove(userId: string, addressId: string) {
    await this.customerRepository.deleteAddress(userId, addressId);
    return this.list(userId);
  }

  async setDefault(userId: string, addressId: string) {
    await this.customerRepository.updateAddress(userId, addressId, { isDefault: true });
    return this.list(userId);
  }
}
