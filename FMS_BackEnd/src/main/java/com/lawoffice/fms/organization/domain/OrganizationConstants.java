package com.lawoffice.fms.organization.domain;

import java.util.UUID;

public final class OrganizationConstants {

    public static final UUID DEFAULT_ORGANIZATION_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000000");

    public static final UUID LEGACY_DEFAULT_ORGANIZATION_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    private OrganizationConstants() {}
}
