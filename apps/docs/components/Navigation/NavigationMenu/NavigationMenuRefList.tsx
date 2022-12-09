import * as Accordion from '@radix-ui/react-accordion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { IconChevronLeft } from 'ui'
import * as NavItems from './NavigationMenu.constants'

import { find } from 'lodash'
import Image from 'next/image'
import { memo } from 'react'

// import apiCommonSections from '~/../../spec/common-client-libs-sections.json'

import RevVersionDropdown from '~/components/RefVersionDropdown'
import { useMenuActiveRefId } from '~/hooks/useMenuState'
import { RefIdOptions, RefKeyOptions } from './NavigationMenu'

const FunctionLink = ({
  title,
  id,
  icon,
  library,
  slug,
}: {
  title: string
  name?: string
  id: string
  icon?: string
  product?: string
  library: string
  slug: string
}) => {
  const router = useRouter()
  const activeAccordianItem = useMenuActiveRefId()

  const active = activeAccordianItem === id
  return (
    <li key={id} className="function-link-item">
      <Link href={`/reference/${library}/${slug}`} passHref>
        <a
          className={[
            'cursor-pointer transition text-sm hover:text-brand-900 flex gap-3',
            active ? 'text-brand-900' : 'text-scale-1000',
          ].join(' ')}
        >
          {icon && <img className="w-3" src={`${router.basePath}${icon}`} />}
          {title}
        </a>
      </Link>
    </li>
  )
}

const SideMenuTitle = ({ title }: { title: string }) => {
  return (
    <span className="font-mono text-xs uppercase text-scale-1200 font-medium tracking-wider mb-3">
      {title}
    </span>
  )
}

const Divider = () => {
  return <div className="h-px w-full bg-blackA-300 dark:bg-whiteA-300 my-3"></div>
}

interface INavigationMenuRefList {
  currentLevel: string

  id: RefIdOptions
  lib: RefKeyOptions
  commonSections: any[] // to do type up
}

const NavigationMenuRefList: React.FC<INavigationMenuRefList> = ({
  currentLevel,

  id,
  lib,
  commonSections,
}) => {
  const router = useRouter()

  let sections = commonSections

  // console.log('sections', sections)
  if (!sections) console.error('no common sections imported')

  const menu = NavItems[id]

  const databaseFunctions = find(sections, { title: 'Database' })
    ? find(sections, { title: 'Database' }).items
    : []

  const filterIds =
    databaseFunctions.length > 0
      ? find(databaseFunctions, {
          id: 'using-filters',
        }) &&
        find(databaseFunctions, {
          id: 'using-filters',
        }).items.map((x) => x.id)
      : []

  const modifierIds =
    databaseFunctions.length > 0
      ? find(databaseFunctions, {
          id: 'using-modifiers',
        }) &&
        find(databaseFunctions, {
          id: 'using-modifiers',
        }).items.map((x) => x.id)
      : []

  // console.log(filterIds)
  // console.log(modifierIds)

  return (
    <div
      className={[
        'transition-all ml-8 duration-150 ease-out',

        // enabled
        currentLevel === id && 'opacity-100 ml-0 delay-150',
        currentLevel === 'home' && 'ml-12',

        // disabled
        currentLevel !== 'home' && currentLevel !== id ? '-ml-8' : '',
        currentLevel !== id ? 'opacity-0 invisible absolute' : '',
      ].join(' ')}
    >
      <div className={'w-full flex flex-col gap-0 sticky top-8'}>
        <Link href="/" passHref>
          <a
            className={[
              'flex items-center gap-1 text-xs group mb-3',
              'text-base transition-all duration-200 text-scale-1100 hover:text-brand-1200 hover:cursor-pointer ',
            ].join(' ')}
          >
            <div className="relative w-2">
              <div className="transition-all ease-out ml-0 group-hover:-ml-1">
                <IconChevronLeft size={10} strokeWidth={3} />
              </div>
            </div>
            <span>Back to Main Menu</span>
          </a>
        </Link>

        <div className="flex items-center gap-3 my-3">
          <Image
            alt={id}
            width={24}
            height={24}
            src={`${router.basePath}` + menu.icon ?? `/img/icons/menu/${id}.svg`}
            className="rounded"
          />
          <span
            className={['font-mono text-sm text-brand-1200 ', !menu.title && 'capitalize'].join(
              ' '
            )}
          >
            {menu.title}
          </span>
          <RevVersionDropdown />
        </div>
        {/* )} */}

        <ul className="function-link-list">
          {sections.map((fn: any) => {
            const RenderLink = (props) => {
              const activeAccordianItem = useMenuActiveRefId()
              let active = false

              const isFilter =
                filterIds && filterIds.length > 0 && filterIds.includes(activeAccordianItem)
              const isModifier =
                modifierIds && modifierIds.length > 0 && modifierIds.includes(activeAccordianItem)

              if (
                (isFilter && !isModifier && props.id === 'using-filters') ||
                (activeAccordianItem === 'using-filters' &&
                  !isModifier &&
                  !isFilter &&
                  props.id === 'using-filters')
              ) {
                active = true
              } else if (
                (isModifier && !isFilter && props.id === 'using-modifiers') ||
                (activeAccordianItem === 'using-modifiers' &&
                  !isFilter &&
                  !isModifier &&
                  props.id === 'using-modifiers')
              ) {
                active = true
              } else {
                active = false
              }

              return (
                <Accordion.Root
                  collapsible
                  key={props.id + 'accordian-root-for-func'}
                  type="single"
                  value={active ? props.id : ''}
                >
                  <Accordion.Item key={props.id + '-accordian-item'} value={props.id}>
                    <FunctionLink {...props} library={lib} />
                    <Accordion.Content
                      key={props.id + '-sub-items-accordion-container'}
                      className="transition data-open:animate-slide-down data-closed:animate-slide-up ml-2"
                    >
                      {props.items &&
                        props.items.map((item) => {
                          return <FunctionLink {...item} library={lib} />
                        })}
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              )
            }

            // handle subtitles with subitems
            if (!fn.id) {
              return (
                <>
                  <Divider />
                  <SideMenuTitle title={fn.title} />
                  {fn.items &&
                    fn.items
                      // .filter((item) => item.libs.includes(lib))
                      .map((item) => <RenderLink {...item} library={menu.title} />)}
                </>
              )
            } else {
              // handle normal links
              return (
                <>
                  <RenderLink {...fn} library={menu.title} />
                  {fn.items &&
                    fn.items
                      // .filter((item) => item.libs.includes(lib))
                      .map((item) => <RenderLink {...item} library={menu.title} />)}
                </>
              )
            }
          })}
        </ul>
        {/* {menu.extras && (
          <>
            <Divider />{' '}
            <span className="font-mono text-xs uppercase text-scale-1200 font-medium tracking-wider mb-2">
              Resources
            </span>
          </>
        )}
        {menu.extras?.map((x) => {
          return (
            <div key={x.name}>
              <li>
                <Link href={`${x.href}`} passHref>
                  <a className="cursor-pointer transition text-scale-1100 text-sm hover:text-brand-900 flex gap-3 my-1">
                    {x.icon && (
                      <Image
                        alt={x.icon}
                        width={20}
                        height={20}
                        src={`${router.basePath}${x.icon}`}
                      />
                    )}
                    {x.name}
                  </a>
                </Link>
              </li>
            </div>
          )
        })} */}
      </div>
    </div>
  )
}

export default memo(NavigationMenuRefList)