import React, { useState } from 'react';
import Input from '../FormElements/Input';
import Select from '../FormElements/Select';
import Button from '../FormElements/Button';
import '../../styles/components.css';

const AddressInfo = ({ formData, onChange }) => {
    const [addresses, setAddresses] = useState(formData.addresses || []);

    const addressTypeOptions = [
        { value: 'current', label: 'Current Address' },
        { value: 'previous', label: 'Previous Address' },
        { value: 'mailing', label: 'Mailing Address' }
    ];

    const addAddress = () => {
        const newAddress = {
            address_type: '',
            street: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'USA'
        };
        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);
        onChange({ target: { name: 'addresses', value: updatedAddresses } });
    };

    const removeAddress = (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
        onChange({ target: { name: 'addresses', value: updatedAddresses } });
    };

    const updateAddress = (index, field, value) => {
        const updatedAddresses = [...addresses];
        updatedAddresses[index][field] = value;
        setAddresses(updatedAddresses);
        onChange({ target: { name: 'addresses', value: updatedAddresses } });
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Address Information</h2>
                <p className="card-subtitle">Add your current and previous addresses</p>
            </div>

            {addresses.map((address, index) => (
                <div key={index} className="dynamic-list-item">
                    <div className="dynamic-list-header">
                        <h3 className="dynamic-list-title">Address {index + 1}</h3>
                        {addresses.length > 1 && (
                            <button
                                className="btn-remove"
                                onClick={() => removeAddress(index)}
                                type="button"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    <Select
                        label="Address Type"
                        name={`address_type_${index}`}
                        value={address.address_type || ''}
                        onChange={(e) => updateAddress(index, 'address_type', e.target.value)}
                        options={addressTypeOptions}
                        required
                    />

                    <Input
                        label="Street Address"
                        name={`street_${index}`}
                        value={address.street || ''}
                        onChange={(e) => updateAddress(index, 'street', e.target.value)}
                        required
                    />

                    <div className="form-grid-3">
                        <Input
                            label="City"
                            name={`city_${index}`}
                            value={address.city || ''}
                            onChange={(e) => updateAddress(index, 'city', e.target.value)}
                            required
                        />

                        <Input
                            label="State"
                            name={`state_${index}`}
                            value={address.state || ''}
                            onChange={(e) => updateAddress(index, 'state', e.target.value)}
                            required
                        />

                        <Input
                            label="ZIP Code"
                            name={`zip_code_${index}`}
                            value={address.zip_code || ''}
                            onChange={(e) => updateAddress(index, 'zip_code', e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Country"
                        name={`country_${index}`}
                        value={address.country || 'USA'}
                        onChange={(e) => updateAddress(index, 'country', e.target.value)}
                        required
                    />
                </div>
            ))}

            <button className="btn-add" onClick={addAddress} type="button">
                + Add Another Address
            </button>
        </div>
    );
};

export default AddressInfo;
