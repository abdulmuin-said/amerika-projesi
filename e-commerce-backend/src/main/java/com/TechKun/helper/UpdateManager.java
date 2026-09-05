package com.TechKun.helper;

import lombok.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.FatalBeanException;
import org.springframework.util.Assert;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.StringUtils;

import java.beans.PropertyDescriptor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.*;
import java.util.function.Function;
import java.util.function.Predicate;

public class UpdateManager<S> {
    private S source;
    private final Map<String, UpdateConfig<?>> updateConfigs = new HashMap<>();

    @Setter
    @RequiredArgsConstructor
    public class UpdateConfig<T> {
        @Getter
        private final String propertyName;
        @Getter
        private String targetPropertyName;
        private Method readMethod;
        private T value;
        private Predicate<T> validator;
        @Getter
        private Function<T, Object> mapper;

        @SuppressWarnings("unchecked")
        public T getValue() {
            if (this.value != null)
                return this.value;
            if (UpdateManager.this.source == null)
                return null;
            if (this.readMethod == null)
                return null;

            try {
                this.value = (T) this.readMethod.invoke(UpdateManager.this.source);
                return this.value;
            } catch (IllegalAccessException | InvocationTargetException e) {
                System.out.println(e.getMessage());
                return null;
            }
        }
        public boolean isValid() {
            return this.validator.test(this.getValue());
        }
    }

    @SuppressWarnings("unchecked")
    private UpdateManager(S source) {
        Assert.notNull(source, "Source cannot be null.");
        this.source = source;
        this.extractUpdateConfigs((Class<S>) source.getClass());
    }
    private UpdateManager(Class<S> sourceType) {
        Assert.notNull(sourceType, "Source type cannot be null.");
        this.extractUpdateConfigs(sourceType);
    }

    public static <S> UpdateManager<S> ofSource(S source) {
        return new UpdateManager<>(source);
    }
    public static <S> UpdateManager<S> ofSourceType(Class<S> sourceType) {
        return new UpdateManager<>(sourceType);
    }

    private void extractUpdateConfigs(Class<S> sourceType) {
        PropertyDescriptor[] pds = BeanUtils.getPropertyDescriptors(sourceType);
        for (PropertyDescriptor pd: pds) {
            String propertyName = pd.getName();
            Class<?> propertyType = pd.getPropertyType();
            if (propertyType.equals(Class.class))
                continue;
            if (propertyType.equals(String.class))
                this.<String>updateConfig(propertyName)
                    .readMethod(pd.getReadMethod())
                    .validator(StringUtils::hasText).add();
            else if (propertyType.equals(Optional.class))
                this.<Optional<?>>updateConfig(propertyName)
                    .readMethod(pd.getReadMethod())
                    .validator(Objects::nonNull)
                    .mapper(o -> o.orElse(null)).add();
            else
                this.updateConfig(propertyName)
                    .readMethod(pd.getReadMethod())
                    .validator(Objects::nonNull).add();
        }
    }

    public void setSource(S source) {
        this.source = source;
        this.updateConfigs.values().forEach(updateConfig -> updateConfig.setValue(null));
    }

    public void removeUpdateConfig(String propertyName) {
        this.updateConfigs.remove(propertyName);
    }

    public boolean nothingToUpdate() {
        return !this.updateConfigs.values().stream().reduce(
            false,
            (update, config) -> update || config.isValid(),
            (a, b) -> a || b
        );
    }


    public void updateProperties(Object target) {
        Assert.notNull(this.source, "Source must not be null");
        Assert.notNull(target, "Target must not be null");
        Class<?> targetClass = target.getClass();

        for (UpdateConfig<?> updateConfig : updateConfigs.values()) {
            if (updateConfig.isValid())
                doUpdate(target, updateConfig, targetClass);
        }
    }

    private <T> void doUpdate(Object target, UpdateConfig<T> updateConfig, Class<?> targetClass) {
        String targetPropertyName = StringUtils.hasText(updateConfig.getTargetPropertyName()) ?
            updateConfig.getTargetPropertyName() : updateConfig.getPropertyName();
        PropertyDescriptor targetPd = BeanUtils.getPropertyDescriptor(targetClass, targetPropertyName);
        if (targetPd == null) return;
        Method writeMethod = targetPd.getWriteMethod();
        if (writeMethod == null) return;
        try {
            ReflectionUtils.makeAccessible(writeMethod);
            T value = updateConfig.getValue();
            Function<T, Object> mapper = updateConfig.getMapper();
            writeMethod.invoke(target, mapper != null ? mapper.apply(value) : value);
        } catch (Throwable ex) {
            throw new FatalBeanException(
                "Could not copy property '" + targetPd.getName() + "' from source to target", ex
            );
        }
    }

    public <T> UpdateConfigBuilder<T> updateConfig(String propertyName) {
        return new UpdateConfigBuilder<>(propertyName);
    }

    public class UpdateConfigBuilder<T> {
        private final String propertyName;
        private String targetPropertyName;
        private Method readMethod;
        private T value;
        private Predicate<T> validator;
        private Function<T, Object> mapper;

        private UpdateConfigBuilder(String propertyName) {
            this.propertyName = propertyName;
        }

        public UpdateConfigBuilder<T> targetPropertyName(String targetPropertyName) {
            this.targetPropertyName = targetPropertyName;
            return this;
        }
        public UpdateConfigBuilder<T> readMethod(Method readMethod) {
            this.readMethod = readMethod;
            return this;
        }
        public UpdateConfigBuilder<T> value(T value) {
            this.value = value;
            return this;
        }
        public UpdateConfigBuilder<T> validator(Predicate<T> validator) {
            this.validator = validator;
            return this;
        }
        public UpdateConfigBuilder<T> mapper(Function<T, Object> mapper) {
            this.mapper = mapper;
            return this;
        }

        public void add() {
            @SuppressWarnings("unchecked")
            UpdateConfig<T> updateConfig = (UpdateConfig<T>) UpdateManager.this.updateConfigs
                .computeIfAbsent(this.propertyName, UpdateConfig::new);
            if (StringUtils.hasText(this.targetPropertyName))
                updateConfig.setTargetPropertyName(this.targetPropertyName);
            if (this.readMethod != null)
                updateConfig.setReadMethod(this.readMethod);
            if (this.value != null)
                updateConfig.setValue(this.value);
            if (this.validator != null)
                updateConfig.setValidator(this.validator);
            if (this.mapper != null)
                updateConfig.setMapper(this.mapper);
        }
    }
}
