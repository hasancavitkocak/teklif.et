-- Add latitude and longitude columns to profiles
ALTER TABLE profiles 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Update existing profiles with approximate coordinates for Turkish cities
UPDATE profiles SET 
  latitude = CASE 
    WHEN city = 'İstanbul' THEN 41.0082
    WHEN city = 'Ankara' THEN 39.9334
    WHEN city = 'İzmir' THEN 38.4192
    WHEN city = 'Bursa' THEN 40.1826
    WHEN city = 'Antalya' THEN 36.8969
    WHEN city = 'Adana' THEN 37.0000
    WHEN city = 'Konya' THEN 37.8667
    WHEN city = 'Gaziantep' THEN 37.0662
    WHEN city = 'Mersin' THEN 36.8000
    WHEN city = 'Diyarbakır' THEN 37.9144
    WHEN city = 'Kayseri' THEN 38.7312
    WHEN city = 'Eskişehir' THEN 39.7767
    WHEN city = 'Urfa' THEN 37.1674
    WHEN city = 'Malatya' THEN 38.3552
    WHEN city = 'Erzurum' THEN 39.9334
    WHEN city = 'Van' THEN 38.4891
    WHEN city = 'Batman' THEN 37.8812
    WHEN city = 'Elazığ' THEN 38.6810
    WHEN city = 'Trabzon' THEN 41.0015
    WHEN city = 'Kocaeli' THEN 40.8533
    ELSE 39.9334 -- Default to Ankara
  END,
  longitude = CASE 
    WHEN city = 'İstanbul' THEN 28.9784
    WHEN city = 'Ankara' THEN 32.8597
    WHEN city = 'İzmir' THEN 27.1287
    WHEN city = 'Bursa' THEN 29.0669
    WHEN city = 'Antalya' THEN 30.7133
    WHEN city = 'Adana' THEN 35.3213
    WHEN city = 'Konya' THEN 32.4833
    WHEN city = 'Gaziantep' THEN 37.3781
    WHEN city = 'Mersin' THEN 34.6333
    WHEN city = 'Diyarbakır' THEN 40.2306
    WHEN city = 'Kayseri' THEN 35.4787
    WHEN city = 'Eskişehir' THEN 30.5206
    WHEN city = 'Urfa' THEN 38.7955
    WHEN city = 'Malatya' THEN 38.3095
    WHEN city = 'Erzurum' THEN 41.2769
    WHEN city = 'Van' THEN 43.4089
    WHEN city = 'Batman' THEN 41.1351
    WHEN city = 'Elazığ' THEN 39.2264
    WHEN city = 'Trabzon' THEN 39.7178
    WHEN city = 'Kocaeli' THEN 29.8815
    ELSE 32.8597 -- Default to Ankara
  END;