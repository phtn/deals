import Link from 'next/link'

interface ToolbarItem {
  id: string
  label: string
  href: string
}

export const Toolbar = () => {
  const toolbarItems: ToolbarItem[] = [
    {id: 'import', label: 'Import', href: '/main/import'},
    {id: 'x', label: 'x', href: '/x'},
  ]

  return (
    <nav className='hidden md:flex items-center gap-1'>
      {toolbarItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className='px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1a1f2e] rounded-lg transition-all duration-200'>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
