import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_RESOURCE_KEY = 'audit_resource';

/**
 * Decorador para marcar endpoints que deben ser auditados
 * @param action - Tipo de acción (ej: 'CREATE_PRODUCT', 'UPDATE_ORDER')
 * @param resource - Tipo de recurso (ej: 'product', 'order', 'user')
 */
export const Audit = (action: string, resource: string) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(AUDIT_ACTION_KEY, action)(target, propertyKey, descriptor);
    SetMetadata(AUDIT_RESOURCE_KEY, resource)(target, propertyKey, descriptor);
  };
};
