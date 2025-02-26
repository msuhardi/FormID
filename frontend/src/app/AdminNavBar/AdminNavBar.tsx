import React, { useCallback, useEffect, useMemo } from 'react'
import { Link as ReactLink } from 'react-router-dom'
import {
  As,
  chakra,
  Flex,
  FlexProps,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'

import { BxsHelpCircle } from '~assets/icons/BxsHelpCircle'
import { ReactComponent as BrandMarkSvg } from '~assets/svgs/brand/brand-mark-colour.svg'
import { FORM_GUIDE } from '~constants/links'
import {
  EMERGENCY_CONTACT_KEY_PREFIX,
  ROLLOUT_ANNOUNCEMENT_KEY_PREFIX,
} from '~constants/localStorage'
import { DASHBOARD_ROUTE } from '~constants/routes'
import { ADMIN_FEEDBACK_SESSION_KEY } from '~constants/sessionStorage'
import { useIsMobile } from '~hooks/useIsMobile'
import { useLocalStorage } from '~hooks/useLocalStorage'
import { logout } from '~services/AuthService'
import IconButton from '~components/IconButton'
import Link from '~components/Link'
import { AvatarMenu, AvatarMenuDivider } from '~templates/AvatarMenu/AvatarMenu'

import { EmergencyContactModal } from '~features/user/emergency-contact/EmergencyContactModal'
import { useUser } from '~features/user/queries'
import { TransferOwnershipModal } from '~features/user/transfer-ownership/TransferOwnershipModal'

import Menu from '../../components/Menu'

const BrandSmallLogo = chakra(BrandMarkSvg)

type AdminNavBarLinkProps = {
  label: string
  href: string
  MobileIcon?: As
}

const NAV_LINKS: AdminNavBarLinkProps[] = [
  {
    label: 'Bantuan',
    href: FORM_GUIDE,
    MobileIcon: BxsHelpCircle,
  },
]

const AdminNavBarLink = ({ MobileIcon, href, label }: AdminNavBarLinkProps) => {
  const isMobile = useIsMobile()

  if (isMobile && MobileIcon) {
    return (
      <IconButton
        variant="clear"
        as="a"
        href={href}
        aria-label={label}
        icon={<MobileIcon fontSize="1.25rem" color="primary.500" />}
      />
    )
  }

  return (
    <Link
      w="fit-content"
      variant="standalone"
      color="secondary.500"
      href={href}
      aria-label={label}
      target="_blank"
    >
      {label}
    </Link>
  )
}

export interface AdminNavBarProps {
  /* This prop is only for testing to show expanded menu state */
  isMenuOpen?: boolean
}

export const AdminNavBar = ({ isMenuOpen }: AdminNavBarProps): JSX.Element => {
  const { user, removeQuery } = useUser()

  const ROLLOUT_ANNOUNCEMENT_KEY = useMemo(
    () => ROLLOUT_ANNOUNCEMENT_KEY_PREFIX + user?._id,
    [user],
  )
  const [hasSeenAnnouncement] = useLocalStorage<boolean>(
    ROLLOUT_ANNOUNCEMENT_KEY,
    false,
  )

  // Only want to show the emergency contact modal if user id exists but user has no emergency contact
  const emergencyContactKey = useMemo(
    () =>
      user && user._id && !user.contact
        ? EMERGENCY_CONTACT_KEY_PREFIX + user._id
        : null,
    [user],
  )

  const [hasSeenContactModal, setHasSeenContactModal] =
    useLocalStorage<boolean>(emergencyContactKey, false)

  const {
    isOpen: isContactModalOpen,
    onClose: onContactModalClose,
    onOpen: onContactModalOpen,
  } = useDisclosure({
    onClose: () => {
      setHasSeenContactModal(true)
    },
  })

  const {
    isOpen: isTransferOwnershipModalOpen,
    onClose: onTransferOwnershipModalClose,
    onOpen: onTransferOwnershipModalOpen,
  } = useDisclosure()

  // Emergency contact modal appears after the rollout announcement modal
  useEffect(() => {
    if (
      hasSeenContactModal === false &&
      user &&
      !user.contact &&
      hasSeenAnnouncement === true
    ) {
      onContactModalOpen()
    }
  }, [hasSeenContactModal, onContactModalOpen, user, hasSeenAnnouncement])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_FEEDBACK_SESSION_KEY)
    logout()
    removeQuery()
    if (emergencyContactKey) {
      localStorage.removeItem(emergencyContactKey)
    }
  }, [emergencyContactKey, removeQuery])

  return (
    <>
      <AdminNavBar.Container>
        <ReactLink title="Form Logo" to={DASHBOARD_ROUTE}>
          {<BrandSmallLogo w="2rem" />}
        </ReactLink>
        <HStack
          textStyle="subhead-1"
          spacing={{ base: '0.75rem', md: '1.5rem' }}
        >
          {NAV_LINKS.map((link, index) => (
            <AdminNavBarLink key={index} {...link} />
          ))}
          <AvatarMenu
            name={user?.email}
            menuUsername={user?.email}
            defaultIsOpen={isMenuOpen}
            menuListProps={{ maxWidth: '19rem' }}
          >
            {/*<Menu.Item onClick={onContactModalOpen}>*/}
            {/*  Emergency contact*/}
            {/*</Menu.Item>*/}
            <Menu.Item onClick={onTransferOwnershipModalOpen}>
              Transfer semua formulir
            </Menu.Item>
            <AvatarMenuDivider />
            <Menu.Item onClick={handleLogout}>Log out</Menu.Item>
          </AvatarMenu>
        </HStack>
      </AdminNavBar.Container>
      <EmergencyContactModal
        onClose={onContactModalClose}
        isOpen={isContactModalOpen}
      />
      <TransferOwnershipModal
        onClose={onTransferOwnershipModalClose}
        isOpen={isTransferOwnershipModalOpen}
      />
    </>
  )
}

interface AdminNavBarContainerProps extends FlexProps {
  children: React.ReactNode
}

AdminNavBar.Container = ({
  children,
  ...props
}: AdminNavBarContainerProps): JSX.Element => {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
      py="0.75rem"
      bg="white"
      borderBottom="1px"
      borderBottomColor="neutral.300"
      {...props}
    >
      {children}
    </Flex>
  )
}
