import React, { useState } from 'react';
import Input from '../FormElements/Input';
import Select from '../FormElements/Select';
import '../../styles/components.css';

const AddressInfo = ({ formData, onChange }) => {
    const [addresses, setAddresses] = useState(formData.addresses || []);

    const addressTypeOptions = [
        { value: 'current', label: 'Current Address' },
        { value: 'permanent', label: 'Permanent Address' },
        { value: 'mailing', label: 'Mailing Address' }
    ];

    const housingStatusOptions = [
        { value: 'own', label: 'Own' },
        { value: 'rent', label: 'Rent' }
    ];

    const addAddress = () => {
        const newAddress = {
            address_type: 'current',
            address_line1: '',
            city: '',
            state: '',
            zip_code: '',
            country: 'USA',
            housing_status: '',
            years_at_address: '',
            months_at_address: ''
        };

        const updated = [...addresses, newAddress];
        setAddresses(updated);
        onChange({ target: { name: 'addresses', value: updated } });
    };

    const removeAddress = (index) => {
        const updated = addresses.filter((_, i) => i !== index);
        setAddresses(updated);
        onChange({ target: { name: 'addresses', value: updated } });
    };

    const updateAddress = (index, field, value) => {
        const updated = [...addresses];
        updated[index][field] = value;
        setAddresses(updated);
        onChange({ target: { name: 'addresses', value: updated } });
    };

    return (
        <div className="card fade-in">
            <div className="card-header">
                <h2 className="card-title">Address Information</h2>
                <p className="card-subtitle">Provide your residential details</p>
            </div>

            {addresses.map((address, index) => (
                <div key={index} className="dynamic-list-item">
                    <div className="dynamic-list-header">
                        <h3 className="dynamic-list-title">Address {index + 1}</h3>
                        {addresses.length > 1 && (
                            <button
                                className="btn-remove"
                                type="button"
                                onClick={() => removeAddress(index)}
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    <Select
                        label="Address Type"
                        value={address.address_type}
                        options={addressTypeOptions}
                        onChange={(e) =>
                            updateAddress(index, 'address_type', e.target.value)
                        }
                        required
                    />

                    <Input
                        label="Address Line 1"
                        value={address.address_line1}
                        onChange={(e) =>
                            updateAddress(index, 'address_line1', e.target.value)
                        }
                        required
                    />

                    <div className="form-grid-3">
                        <Input
                            label="City"
                            value={address.city}
                            onChange={(e) =>
                                updateAddress(index, 'city', e.target.value)
                            }
                            required
                        />

                        <Input
                            label="State"
                            value={address.state}
                            onChange={(e) =>
                                updateAddress(index, 'state', e.target.value)
                            }
                            required
                        />

                        <Input
                            label="ZIP Code"
                            value={address.zip_code}
                            onChange={(e) =>
                                updateAddress(index, 'zip_code', e.target.value)
                            }
                            required
                        />
                    </div>

                    <Select
                        label="Housing Status"
                        value={address.housing_status}
                        options={housingStatusOptions}
                        onChange={(e) =>
                            updateAddress(index, 'housing_status', e.target.value)
                        }
                        required
                    />

                    <div className="form-grid-2">
                        <Input
                            label="Years at Address"
                            type="number"
                            min="0"
                            max="50"
                            value={address.years_at_address}
                            onChange={(e) =>
                                updateAddress(index, 'years_at_address', Number(e.target.value))
                            }
                            required
                        />

                        <Input
                            label="Months at Address"
                            type="number"
                            min="0"
                            max="11"
                            value={address.months_at_address}
                            onChange={(e) =>
                                updateAddress(index, 'months_at_address', Number(e.target.value))
                            }
                            required
                        />
                    </div>
                </div>
            ))}

            <button className="btn-add" type="button" onClick={addAddress}>
                + Add Another Address
            </button>
        </div>
    );
};

export default AddressInfo;
